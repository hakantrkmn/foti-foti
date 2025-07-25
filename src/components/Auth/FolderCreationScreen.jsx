import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { FirebaseService, generateHash } from '../../services/firebase';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useCamera } from '../Camera'; 
import { getUploadUrl } from '../../utils/config';
import { DarkModeToggle } from '../DarkModeToggle';
import { AuthButton } from '../Camera';
import { logger } from '../../utils/logger.js';

const LoginPrompt = ({ onLogin, isLoading }) => (
    <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Authentication Required</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in with your Google account to create or manage a folder.
        </p>
        <button
            onClick={onLogin}
            disabled={isLoading}
            className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
        >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
    </div>
);


export const FolderCreationScreen = ({ onBack }) => {
  const [folderId, setFolderId] = useState('');
  const [limit, setLimit] = useState(10);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { trackFolderCreation } = useAnalytics();
  const { isAuthenticated, userInfo, handleAutoAuth, isLoading: isAuthLoading } = useCamera();

  const [existingFolderData, setExistingFolderData] = useState(null);
  const [isNewFolder, setIsNewFolder] = useState(true);


  const generateQrForExistingFolder = useCallback(async (data) => {
    try {
        const hash = generateHash({ folderId: data.folderId, limit: data.limit, createdBy: data.createdBy, ownerId: data.ownerId });
        const qrData = getUploadUrl(data.folderId, hash);
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrCodeUrl(qrCodeDataUrl);
    } catch {
        setError("Could not generate QR code for existing folder.");
    }
  }, []);

  useEffect(() => {
    const checkFolderExistence = async () => {
        if (folderId.trim().length > 10) { // Basic validation
            const result = await FirebaseService.getFolder(folderId.trim());
            if (result.success) {
                setExistingFolderData(result.data);
                setLimit(result.data.limit);
                setIsNewFolder(false);
                setError(''); // Clear previous not found errors
                generateQrForExistingFolder(result.data);
            } else {
                setExistingFolderData(null);
                setIsNewFolder(true);
                setQrCodeUrl(''); // Clear QR if folder not found
            }
        } else {
            setExistingFolderData(null);
            setIsNewFolder(true);
            setQrCodeUrl('');
        }
    };

    const handler = setTimeout(() => {
        checkFolderExistence();
    }, 500); // Debounce check

    return () => {
        clearTimeout(handler);
    };
  }, [folderId, generateQrForExistingFolder]);


  const generateQRCode = async () => {
    if (!folderId.trim() || !userInfo) {
      setError('Please enter a Google Drive folder ID and make sure you are logged in.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const result = await FirebaseService.createFolder(
        folderId.trim(),
        limit,
        userInfo.name, // createdBy
        userInfo.id    // ownerId
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      trackFolderCreation(folderId.trim(), limit);

      const qrData = getUploadUrl(folderId.trim(), result.hash);
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
      setExistingFolderData({ ...result.folderData, ownerId: userInfo.id });
      setIsNewFolder(false);
      setSuccess('QR code created successfully!');
    } catch (error) {
      logger.error('QR code generation error:', error);
      setError('Error creating QR code: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl || !userInfo) return;

    try {
        if (!existingFolderData) throw new Error("Folder data not available.");
        const hash = generateHash({ folderId: existingFolderData.folderId, limit, createdBy: existingFolderData.createdBy, ownerId: existingFolderData.ownerId });
        const qrData = getUploadUrl(folderId.trim(), hash);
        await navigator.clipboard.writeText(qrData);
        alert('URL copied to clipboard!');
    } catch (error) {
      logger.error('Copy to clipboard error:', error);
      alert('Could not copy URL.');
    }
  };

  const updateFolderLimit = async () => {
    if (!folderId.trim() || !userInfo) {
      setError('Please enter the folder ID and make sure you are logged in.');
      return;
    }

    try {
      const result = await FirebaseService.updateFolderLimit(folderId.trim(), limit, userInfo.id);
      
      if (result.success) {
        setSuccess('Folder limit updated successfully!');
        // Refetch folder data and regenerate QR
        const updatedFolder = await FirebaseService.getFolder(folderId.trim());
        if (updatedFolder.success) {
            setExistingFolderData(updatedFolder.data);
            await generateQrForExistingFolder(updatedFolder.data);
        }
      } else {
        setError('Failed to update limit: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      logger.error('Limit update error:', error);
      setError('An error occurred while updating the limit.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6 gap-2 sm:gap-4">
            <div className="flex-shrink-0">
                <button
                  onClick={onBack}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
            </div>
            <div className="flex-1 min-w-0 text-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  Create or Manage Folder
                </h2>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
              <DarkModeToggle />
              {isAuthenticated && <AuthButton />}
            </div>
          </div>
          
          {!isAuthenticated ? (
            <LoginPrompt onLogin={handleAutoAuth} isLoading={isAuthLoading} />
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Drive Folder ID
                </label>
                <input
                  id="folderId"
                  type="text"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  placeholder="Enter Google Drive folder ID"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                 <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2"><strong>How to get Folder ID:</strong></p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Create a folder in Google Drive and set sharing to "Anyone with the link".</li>
                        <li>Copy the ID from the folder URL: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">.../folders/FOLDER_ID_HERE</code></li>
                    </ol>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Limit per User
                </label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={5}>5 photos</option>
                  <option value={10}>10 photos</option>
                  <option value={20}>20 photos</option>
                  <option value={50}>50 photos</option>
                  <option value={100}>100 photos</option>
                  <option value={-1}>Unlimited</option>
                </select>
              </div>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

              <div className="mb-6 space-y-4">
                {isNewFolder ? (
                    <button
                        onClick={generateQRCode}
                        disabled={isGenerating || !folderId.trim()}
                        className="w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Create New QR Code'}
                    </button>
                ) : (
                    <div>
                        <button
                            onClick={updateFolderLimit}
                            disabled={!existingFolderData || existingFolderData.ownerId !== userInfo.id}
                            className="w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                            Update Limit
                        </button>
                        {existingFolderData && existingFolderData.ownerId !== userInfo.id && (
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                You must be the folder owner to update the limit.
                            </p>
                        )}
                    </div>
                )}
              </div>
            
              {qrCodeUrl && (
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">QR Code Ready!</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 mb-4">
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4"/>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scan this to access the upload page.</p>
                    <button onClick={copyToClipboard} className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                      Copy URL
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 