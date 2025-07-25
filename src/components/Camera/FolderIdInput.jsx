import { useCamera } from '../../hooks/useCamera'

export const FolderIdInput = () => {
  const { folderId, updateFolderId, uploadLimit, currentUploadCount } = useCamera()

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3">
        Google Drive Folder Settings
      </h3>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 mb-1">
            Folder ID
          </label>
          <input
            id="folderId"
            type="text"
            value={folderId}
            onChange={(e) => updateFolderId(e.target.value)}
            placeholder="Enter Google Drive folder ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Limit Information */}
        {uploadLimit !== null && uploadLimit !== -1 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">Upload Limit</span>
              <span className="text-sm text-blue-600">
                {currentUploadCount} / {uploadLimit}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((currentUploadCount / uploadLimit) * 100, 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="text-xs text-blue-600">
              {currentUploadCount >= uploadLimit ? (
                <span className="text-red-600 font-medium">⚠️ Limit reached!</span>
              ) : (
                <span>Remaining: {uploadLimit - currentUploadCount} photos</span>
              )}
            </div>
          </div>
        )}

        {/* Unlimited Upload */}
        {uploadLimit === -1 && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-800">Unlimited Upload</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              You can upload unlimited photos to this folder.
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>How to get Folder ID:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Create a folder in Google Drive</li>
            <li>Right-click on folder → "Share" → "Anyone with the link" → "Viewer"</li>
            <li>Copy ID from folder URL: <code className="bg-gray-200 px-1 rounded">https://drive.google.com/drive/folders/FOLDER_ID_HERE</code></li>
            <li>Paste the <code className="bg-gray-200 px-1 rounded">FOLDER_ID_HERE</code> part in the box above</li>
          </ol>
        </div>
        
        {folderId && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            ✅ Folder ID saved. Photos will be uploaded to this folder.
          </div>
        )}
      </div>
    </div>
  )
} 