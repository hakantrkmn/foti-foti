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

  return (
    <div className="w-full max-w-2xl mx-auto animate-scale-in">
      <div className="relative">
        <img 
          src={capturedImage} 
          alt="Çekilen fotoğraf" 
          className="w-full rounded-xl shadow-2xl"
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl pointer-events-none" />
      </div>
      
      {/* Auth Status */}
      {isAuthenticated && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
          ✅ Google Drive'a bağlandı
        </div>
      )}
      
      {/* Upload Queue Status */}
      {uploadQueue.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 text-center">
            Yükleme Durumu ({activeUploads} aktif)
          </h3>
          {uploadQueue.map((upload) => (
            <div key={upload.id} className={`p-3 rounded-lg border ${
              upload.status === 'success' 
                ? 'bg-green-100 border-green-400 text-green-700' 
                : upload.status === 'error'
                ? 'bg-red-100 border-red-400 text-red-700'
                : 'bg-blue-100 border-blue-400 text-blue-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{upload.fileName}</div>
                  <div className="text-xs">
                    {upload.status === 'pending' && 'Hazırlanıyor...'}
                    {upload.status === 'uploading' && 'Yükleniyor...'}
                    {upload.status === 'success' && '✅ Başarıyla yüklendi'}
                    {upload.status === 'error' && `❌ Hata: ${upload.error}`}
                  </div>
                </div>
                {upload.status === 'uploading' && (
                  <div className="ml-3">
                    <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
                {upload.status === 'success' && upload.webViewLink && (
                  <a 
                    href={upload.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-3 text-green-600 hover:text-green-800 underline text-xs"
                  >
                    Görüntüle
                  </a>
                )}
              </div>
              {upload.status === 'uploading' && (
                <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Legacy Upload Status */}
      {uploadStatus && uploadQueue.length === 0 && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          uploadStatus.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          {typeof uploadStatus === 'string' ? uploadStatus : uploadStatus.message}
          {uploadStatus.type === 'success' && uploadStatus.webViewLink && (
            <div className="mt-2">
              <a 
                href={uploadStatus.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 underline"
              >
                Google Drive'da Görüntüle
              </a>
            </div>
          )}
        </div>
      )}
      
      <div className="flex gap-4 justify-center mt-6 flex-wrap">
        <button
          onClick={uploadToGoogleDrive}
          disabled={isLoading || !isGoogleDriveInitialized || !folderId.trim()}
          className={`
            flex items-center px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600
            rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-green-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yükleniyor...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Google Drive'a Yükle
            </>
          )}
        </button>
        
        <button
          onClick={resetPhoto}
          disabled={isLoading}
          className="
            flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600
            rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-blue-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yeni Fotoğraf Çek
        </button>
      </div>
      
      {!isGoogleDriveInitialized && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-center">
          Google Drive bağlantısı kuruluyor...
        </div>
      )}
      
      {!folderId.trim() && (
        <div className="mt-4 p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg text-center">
          ⚠️ Google Drive'a yüklemek için önce klasör ID'sini girin.
        </div>
      )}
    </div>
  )
} 