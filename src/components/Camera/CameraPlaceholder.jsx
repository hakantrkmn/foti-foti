import { CameraButton } from './CameraButton'
import { useCamera } from '../../hooks/useCamera'

export const CameraPlaceholder = () => {
  const { uploadLimit, currentUploadCount, userInfo, uploadQueue, activeUploads } = useCamera()
  return (
    <div className="text-center py-8 sm:py-12">
      {/* Upload Status Display */}
      {userInfo && uploadLimit !== null && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {userInfo.name || 'User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {userInfo.email || 'unknown@example.com'}
                </p>
              </div>
            </div>
            
            {uploadLimit !== -1 ? (
              <div className="text-right">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Upload Status
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {currentUploadCount} / {uploadLimit} photos
                </p>
                <div className="w-20 bg-blue-200 dark:bg-blue-700 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((currentUploadCount / uploadLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Unlimited Upload
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {currentUploadCount} photos uploaded
                </p>
              </div>
            )}
          </div>
          
          {/* Status Message */}
          {uploadLimit !== -1 && currentUploadCount >= uploadLimit ? (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
              ⚠️ Upload limit reached! You cannot upload more photos.
            </div>
          ) : uploadLimit !== -1 && currentUploadCount >= uploadLimit * 0.8 ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-lg text-sm">
              ⚠️ 80% of your limit is used. Remaining: {uploadLimit - currentUploadCount} photos
            </div>
          ) : uploadLimit !== -1 ? (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm">
              ✅ Remaining: {uploadLimit - currentUploadCount} photos can be uploaded
            </div>
          ) : (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm">
              ✅ Unlimited upload active
            </div>
          )}
        </div>
      )}

      {/* Upload Queue Display */}
      {uploadQueue.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Upload Status ({activeUploads} active)
          </h3>
          {uploadQueue.map((upload) => (
            <div key={upload.id} className={`p-3 rounded-lg border ${
              upload.status === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-700 dark:text-green-400' 
                : upload.status === 'error'
                ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{upload.fileName}</div>
                  <div className="text-xs">
                    {upload.status === 'pending' && 'Preparing...'}
                    {upload.status === 'uploading' && 'Uploading...'}
                    {upload.status === 'success' && '✅ Successfully uploaded'}
                    {upload.status === 'error' && `❌ Error: ${upload.error}`}
                  </div>
                </div>
                {upload.status === 'uploading' && (
                  <div className="ml-3">
                    <div className="w-6 h-6 border-2 border-blue-300 dark:border-blue-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  </div>
                )}
                {upload.status === 'success' && upload.webViewLink && (
                  <a 
                    href={upload.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline text-xs"
                  >
                    View
                  </a>
                )}
              </div>
              {upload.status === 'uploading' && (
                <div className="mt-2 w-full bg-blue-200 dark:bg-blue-700 rounded-full h-1">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ready to Take Photo
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Click the button below to open camera
        </p>
      </div>
      
      <CameraButton />
    </div>
  )
} 