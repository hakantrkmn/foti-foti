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
    uploadQueue,
    activeUploads
  } = useCamera()

  if (!capturedImage) return null

  // Check if there are any authentication errors in the upload queue
  const hasAuthError = uploadQueue.some(upload => 
    upload.status === 'error' && 
    (upload.isAuthError || upload.error.includes('Oturum süreniz doldu') || upload.error.includes('erişim izniniz geçersiz') || upload.error.includes('yeniden giriş'))
  )

  return (
    <div className="w-full max-w-lg mx-auto animate-scale-in">
      {/* Enhanced Image Preview */}
      <div className="relative mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          <img 
            src={capturedImage} 
            alt="Captured photo" 
            className="w-full max-h-80 object-contain bg-gray-50 dark:bg-gray-800"
            style={{ minHeight: '200px' }}
          />
          {/* Subtle overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </div>
        
        {/* Photo info */}
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            📸 Photo ready for upload
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex gap-3 justify-center mb-4">
        <button
          onClick={uploadToGoogleDrive}
          disabled={isLoading || !isGoogleDriveInitialized || !folderId.trim()}
          className={`
            flex-1 flex items-center justify-center px-6 py-3 text-white font-medium
            bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg
            hover:shadow-xl hover:from-green-600 hover:to-green-700 
            transform hover:-translate-y-1 transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-green-300/50
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            max-w-[160px]
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload to Drive
            </>
          )}
        </button>
        
        <button
          onClick={resetPhoto}
          disabled={isLoading}
          className="
            flex-1 flex items-center justify-center px-6 py-3 text-gray-700 dark:text-gray-300 font-medium
            bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-lg
            hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500
            transform hover:-translate-y-1 transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-gray-300/50 dark:focus:ring-gray-500/50
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            max-w-[160px]
          "
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Take New Photo
        </button>
      </div>
      
      {/* Enhanced Status Messages */}
      {hasAuthError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="font-medium">Oturum Süreniz Doldu!</div>
                <div className="text-xs mt-1">Fotoğraf yüklemek için tekrar giriş yapmanız gerekiyor.</div>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Tekrar Giriş
            </button>
          </div>
        </div>
      )}
      
      {!isGoogleDriveInitialized && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 rounded-r-lg text-sm">
          <div className="flex items-center">
            <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting to Google Drive...
          </div>
        </div>
      )}
      
      {!folderId.trim() && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-400 rounded-r-lg text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please enter folder ID to upload
          </div>
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