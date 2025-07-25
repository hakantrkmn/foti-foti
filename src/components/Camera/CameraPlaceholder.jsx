import { CameraButton } from './CameraButton'
import { useCamera } from '../../hooks/useCamera'

export const CameraPlaceholder = () => {
  const { uploadLimit, currentUploadCount, userInfo } = useCamera()
  return (
    <div className="text-center py-12">
      {/* Upload Status Display */}
      {userInfo && uploadLimit !== null && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">
                  {userInfo.name || 'Kullanıcı'}
                </p>
                <p className="text-xs text-gray-600">
                  {userInfo.email || 'unknown@example.com'}
                </p>
              </div>
            </div>
            
            {uploadLimit !== -1 ? (
              <div className="text-right">
                <p className="text-sm font-medium text-blue-800">
                  Yükleme Durumu
                </p>
                <p className="text-xs text-blue-600">
                  {currentUploadCount} / {uploadLimit} fotoğraf
                </p>
                <div className="w-20 bg-blue-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((currentUploadCount / uploadLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm font-medium text-green-800">
                  Limitsiz Yükleme
                </p>
                <p className="text-xs text-green-600">
                  {currentUploadCount} fotoğraf yüklendi
                </p>
              </div>
            )}
          </div>
          
          {/* Status Message */}
          {uploadLimit !== -1 && currentUploadCount >= uploadLimit ? (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
              ⚠️ Yükleme limitiniz doldu! Daha fazla fotoğraf yükleyemezsiniz.
            </div>
          ) : uploadLimit !== -1 && currentUploadCount >= uploadLimit * 0.8 ? (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-3 py-2 rounded-lg text-sm">
              ⚠️ Limitinizin %80'i doldu. Kalan: {uploadLimit - currentUploadCount} fotoğraf
            </div>
          ) : uploadLimit !== -1 ? (
            <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-lg text-sm">
              ✅ Kalan: {uploadLimit - currentUploadCount} fotoğraf yükleyebilirsiniz
            </div>
          ) : (
            <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-lg text-sm">
              ✅ Limitsiz yükleme aktif
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Fotoğraf Çekmeye Hazır
        </h3>
        <p className="text-gray-500">
          Kamerayı açmak için aşağıdaki butona tıklayın
        </p>
      </div>
      
      <CameraButton />
    </div>
  )
} 