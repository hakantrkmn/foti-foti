import { useCamera } from '../../hooks/useCamera'

export const ImagePreview = () => {
  const { 
    capturedImage, 
    resetPhoto, 
    uploadToGoogleDrive, 
    isLoading, 
    uploadStatus, 
    isGoogleDriveInitialized, 
    folderId, 
    isAuthenticated,
    uploadQueue,
    activeUploads
  } = useCamera()

  if (!capturedImage) return null

  // Check if there are any authentication errors in the upload queue
  const hasAuthError = uploadQueue.some(upload => 
    upload.status === 'error' && 
    upload.error && 
    (upload.error.includes('erişim izniniz geçersiz') || upload.error.includes('yeniden giriş'))
  )

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      {/* Compact Image Preview */}
      <div className="relative mb-4">
        <img 
          src={capturedImage} 
          alt="Captured photo" 
          className="w-full h-64 object-cover rounded-lg shadow-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-5 rounded-lg pointer-events-none" />
      </div>

      {/* Compact Action Buttons */}
      <div className="flex gap-3 justify-center mb-4">
        <button
          onClick={uploadToGoogleDrive}
          disabled={isLoading || !isGoogleDriveInitialized || !folderId.trim()}
          className={`
            flex-1 flex items-center justify-center px-4 py-3 text-white text-sm font-medium
            bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md
            hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-green-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            max-w-[140px]
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </>
          )}
        </button>
        
        <button
          onClick={resetPhoto}
          disabled={isLoading}
          className="
            flex-1 flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 text-sm font-medium
            bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md
            hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transform hover:-translate-y-0.5 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            max-w-[140px]
          "
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retake
        </button>
      </div>
      
      {/* Compact Status Messages */}
      {hasAuthError && (
        <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-md text-xs text-center">
          ⚠️ Authentication expired - please try again
        </div>
      )}
      
      {!isGoogleDriveInitialized && (
        <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 rounded-md text-xs text-center">
          Connecting to Google Drive...
        </div>
      )}
      
      {!folderId.trim() && (
        <div className="mb-3 p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-400 rounded-md text-xs text-center">
          ⚠️ Please enter folder ID
        </div>
      )}

      {/* Compact Upload Queue Status */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
            {activeUploads > 0 ? `Uploading ${activeUploads}...` : 'Upload Complete'}
          </div>
          {uploadQueue.map((upload) => (
            <div key={upload.id} className={`p-2 rounded-md text-xs ${
              upload.status === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : upload.status === 'error'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 truncate">
                  {upload.status === 'pending' && '⏳ Preparing...'}
                  {upload.status === 'uploading' && '📤 Uploading...'}
                  {upload.status === 'success' && '✅ Uploaded'}
                  {upload.status === 'error' && `❌ ${upload.error}`}
                </div>
                {upload.status === 'uploading' && (
                  <div className="ml-2">
                    <div className="w-4 h-4 border border-blue-300 dark:border-blue-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  </div>
                )}
                {upload.status === 'success' && upload.webViewLink && (
                  <a 
                    href={upload.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-green-600 dark:text-green-400 hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
              {upload.status === 'uploading' && (
                <div className="mt-1 w-full bg-blue-200 dark:bg-blue-700 rounded-full h-0.5">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-0.5 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Legacy Upload Status - Compact */}
      {uploadStatus && uploadQueue.length === 0 && (
        <div className={`p-2 rounded-md text-xs text-center ${
          uploadStatus.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        }`}>
          {typeof uploadStatus === 'string' ? uploadStatus : uploadStatus.message}
          {uploadStatus.type === 'success' && uploadStatus.webViewLink && (
            <div className="mt-1">
              <a 
                href={uploadStatus.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                View in Drive
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 