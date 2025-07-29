import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { FirebaseService, generateHash } from '../../services/firebase';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useCamera } from '../Camera'; 
import { getUploadUrl } from '../../utils/config';
import { DarkModeToggle } from '../DarkModeToggle';
import { AuthButton } from '../Camera';
import { logger } from '../../utils/logger.js';
import { googleDriveService } from '../../services/googleDrive';

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

// Tab selector component
const TabSelector = ({ activeTab, onTabChange }) => (
  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
    <button
      onClick={() => onTabChange('create')}
      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
        activeTab === 'create'
          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Create New Folder
    </button>
    <button
      onClick={() => onTabChange('existing')}
      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
        activeTab === 'existing'
          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
      Use Existing Folder
    </button>
  </div>
);

// Create new folder component
const CreateNewFolder = ({ 
  folderName, 
  setFolderName, 
  limit, 
  setLimit, 
  isCreating, 
  onCreateFolder, 
  error, 
  success,
  createdFolderData
}) => (
  <div className="space-y-6">
    <div>
      <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Folder Name
      </label>
      <input
        id="folderName"
        type="text"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        placeholder="Enter folder name (e.g., Event Photos 2024)"
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        A new public folder will be created in your Google Drive with "Anyone with the link can edit" permission.
      </p>
    </div>

    <div>
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

    {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
    {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

    <button
      onClick={onCreateFolder}
      disabled={isCreating || !folderName.trim()}
      className="w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
    >
      {isCreating ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating Folder...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Folder
        </>
      )}
    </button>

    {/* Show created folder info */}
    {createdFolderData && (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6">
        <h4 className="text-md font-medium text-green-800 dark:text-green-300 mb-3">✅ Folder Created Successfully!</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
            <span className="text-sm text-gray-600 dark:text-gray-400">Folder ID:</span>
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {createdFolderData.folderId}
            </code>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
            <span className="text-sm text-gray-600 dark:text-gray-400">Folder Name:</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {createdFolderData.folderName}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
            <span className="text-sm text-gray-600 dark:text-gray-400">Upload Limit:</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {limit === -1 ? 'Unlimited' : `${limit} photos`}
            </span>
          </div>
          
          {createdFolderData.webViewLink && (
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
              <span className="text-sm text-gray-600 dark:text-gray-400">Google Drive Link:</span>
              <a 
                href={createdFolderData.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Open in Drive
              </a>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
          <p className="text-xs text-green-600 dark:text-green-400 mb-2">
            🎉 Your folder has been created and is ready for photo uploads!
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            📱 Switch to "Use Existing Folder" tab to generate a QR code for sharing.
          </p>
        </div>
      </div>
    )}
  </div>
);

// Use existing folder component
const UseExistingFolder = ({ 
  folderId, 
  setFolderId, 
  limit, 
  setLimit, 
  qrCodeUrl, 
  isGenerating, 
  error, 
  success, 
  onGenerateQR, 
  onUpdateLimit, 
  onCopyToClipboard,
  existingFolderData,
  isNewFolder,
  folderValidation,
  isValidating,
  userInfo,
  getGoogleDriveLink
}) => (
  <div className="space-y-6">
    <div>
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
      
      {/* Folder Validation Status */}
      {isValidating && (
        <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Validating folder...</span>
        </div>
      )}
      
      {folderValidation && !isValidating && (
        <div className={`mt-2 p-2 rounded text-sm ${
          folderValidation.success 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }`}>
          {folderValidation.success ? (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {folderValidation.message}
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {folderValidation.error}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2"><strong>How to get Folder ID:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create a folder in Google Drive and set sharing to "Anyone with the link can edit".</li>
          <li>Copy the ID from the folder URL: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">.../folders/FOLDER_ID_HERE</code></li>
        </ol>
      </div>
    </div>

    <div>
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

    {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
    {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

    <div className="space-y-4">
      {isNewFolder ? (
        <button
          onClick={onGenerateQR}
          disabled={isGenerating || !folderId.trim() || !folderValidation?.success}
          className="w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Create New QR Code'}
        </button>
      ) : (
        <div>
          <button
            onClick={onUpdateLimit}
            disabled={!existingFolderData || existingFolderData.ownerId !== userInfo?.id || !folderValidation?.success}
            className="w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            Update Limit
          </button>
          {existingFolderData && existingFolderData.ownerId !== userInfo?.id && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              You must be the folder owner to update the limit.
            </p>
          )}
        </div>
      )}
      
      {/* Validation warning */}
      {folderId.trim() && folderValidation && !folderValidation.success && !isValidating && (
        <div className="p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg text-sm">
          <strong>⚠️ Cannot create QR code:</strong> Folder validation failed. Please ensure the folder is public and has "Anyone with the link can edit" permission.
        </div>
      )}
    </div>

    {qrCodeUrl && (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">QR Code Ready!</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 mb-4">
          <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4"/>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scan this to access the upload page.</p>
          <button onClick={onCopyToClipboard} className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 mb-3">
            Copy URL
          </button>
        </div>
        
        {/* Folder Link Section */}
        {existingFolderData && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mb-4">
            <h4 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-3">📁 Folder Access</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span className="text-sm text-gray-600 dark:text-gray-400">Folder ID:</span>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {existingFolderData.folderId}
                </code>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span className="text-sm text-gray-600 dark:text-gray-400">Upload Limit:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {existingFolderData.limit === -1 ? 'Unlimited' : `${existingFolderData.limit} photos`}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span className="text-sm text-gray-600 dark:text-gray-400">Created by:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {existingFolderData.createdBy || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {existingFolderData.createdAt ? new Date(existingFolderData.createdAt).toLocaleDateString('tr-TR') : 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span className="text-sm text-gray-600 dark:text-gray-400">Google Drive:</span>
                <a 
                  href={getGoogleDriveLink(existingFolderData.folderId)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Open in Drive
                </a>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                💡 Share this QR code with others to allow them to upload photos to your folder.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                🔒 The folder is set to "Anyone with the link can edit" for easy sharing.
              </p>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export const FolderCreationScreen = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'existing'
  
  // Create new folder state
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdFolderData, setCreatedFolderData] = useState(null);
  
  // Existing folder state
  const [folderId, setFolderId] = useState('');
  const [limit, setLimit] = useState(10);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingFolderData, setExistingFolderData] = useState(null);
  const [isNewFolder, setIsNewFolder] = useState(true);
  const [folderValidation, setFolderValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const { trackFolderCreation } = useAnalytics();
  const { isAuthenticated, userInfo, handleAutoAuth, isLoading: isAuthLoading } = useCamera();

  // Validate folder with Google Drive API
  const validateFolder = useCallback(async (folderId) => {
    if (!folderId.trim() || folderId.trim().length < 10) {
      setFolderValidation(null);
      return;
    }

    setIsValidating(true);
    setFolderValidation(null);

    try {
      const result = await googleDriveService.validateFolderWithApiKey(folderId.trim());
      setFolderValidation(result);
    } catch (error) {
      logger.error('Folder validation error:', error);
      setFolderValidation({
        success: false,
        error: 'An error occurred during folder validation.'
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

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
            // First validate with Google Drive API
            await validateFolder(folderId.trim());
            
            // Then check Firebase
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
            setFolderValidation(null);
        }
    };

    const handler = setTimeout(() => {
        checkFolderExistence();
    }, 500); // Debounce check

    return () => {
        clearTimeout(handler);
    };
  }, [folderId, generateQrForExistingFolder, validateFolder]);

  // Create new folder function
  const handleCreateNewFolder = async () => {
    if (!folderName.trim() || !userInfo) {
      setError('Please enter a folder name and make sure you are logged in.');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      // Create folder in Google Drive
      const result = await googleDriveService.createFolder(folderName.trim());
      
      if (result.success) {
        setSuccess(result.message);
        
        // Store created folder data
        setCreatedFolderData({
          folderId: result.folderId,
          folderName: result.folderName,
          webViewLink: result.webViewLink
        });
        
        // If folder was created successfully, switch to existing folder tab and populate the folder ID
        if (result.folderId) {
          setFolderId(result.folderId);
          setActiveTab('existing');
          
          // Show warning if sharing setup failed
          if (result.warning) {
            setError(result.warning);
          }
        }
        
        // Reset form
        setFolderName('');
        
        // Track folder creation
        trackFolderCreation(result.folderId, limit);
        
      } else {
        setError(result.error || 'Failed to create folder');
      }
      
    } catch (error) {
      logger.error('Folder creation error:', error);
      setError('Error creating folder: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const generateQRCode = async () => {
    if (!folderId.trim() || !userInfo) {
      setError('Please enter a Google Drive folder ID and make sure you are logged in.');
      return;
    }

    // Check folder validation first
    if (!folderValidation || !folderValidation.success) {
      setError('Folder validation failed. Please enter a valid public folder ID.');
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

  const getGoogleDriveLink = (folderId) => {
    return `https://drive.google.com/drive/folders/${folderId}`;
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

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Clear created folder data when switching tabs
    if (newTab === 'existing') {
      setCreatedFolderData(null);
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
              <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
              
              {activeTab === 'create' ? (
                <CreateNewFolder
                  folderName={folderName}
                  setFolderName={setFolderName}
                  limit={limit}
                  setLimit={setLimit}
                  isCreating={isCreating}
                  onCreateFolder={handleCreateNewFolder}
                  error={error}
                  success={success}
                  createdFolderData={createdFolderData}
                />
              ) : (
                <UseExistingFolder
                  folderId={folderId}
                  setFolderId={setFolderId}
                  limit={limit}
                  setLimit={setLimit}
                  qrCodeUrl={qrCodeUrl}
                  isGenerating={isGenerating}
                  error={error}
                  success={success}
                  onGenerateQR={generateQRCode}
                  onUpdateLimit={updateFolderLimit}
                  onCopyToClipboard={copyToClipboard}
                  existingFolderData={existingFolderData}
                  isNewFolder={isNewFolder}
                  folderValidation={folderValidation}
                  isValidating={isValidating}
                  userInfo={userInfo}
                  getGoogleDriveLink={getGoogleDriveLink}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 