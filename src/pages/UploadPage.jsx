import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CameraProvider,
  CameraButton,
  ImagePreview,
  CameraPlaceholder,
  useCamera
} from '../components/Camera'
import React from 'react'

export const UploadPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const folderId = searchParams.get('folderId')
  
  // URL'de folderId yoksa ana sayfaya yönlendir
  if (!folderId) {
    console.log('UploadPage: No folderId in URL, redirecting to home')
    navigate('/', { replace: true })
    return null
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <CameraProvider>
      <UploadPageContent onBackToHome={handleBackToHome} />
    </CameraProvider>
  )
}

function UploadPageContent({ onBackToHome }) {
  const { isAuthenticated, handleAutoAuth, isLoading, userInfo, uploadLimit, currentUploadCount } = useCamera()

  // Otomatik giriş özelliği kaldırıldı - timeout sorunu nedeniyle

  // Giriş yapılmamışsa giriş ekranını göster
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <header className="text-center mb-8">
              <button
                onClick={onBackToHome}
                className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Ana Sayfa
              </button>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Google Drive Girişi
              </h1>
              <p className="text-gray-600">
                Fotoğraf yüklemek için Google Drive'a giriş yapın
              </p>
            </header>

            <div className="text-center">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Google Drive'a giriş yapılıyor...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleAutoAuth}
                    className="
                      w-full flex items-center justify-center px-6 py-4 text-lg font-medium
                      text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl
                      shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                      focus:outline-none focus:ring-4 focus:ring-blue-300
                    "
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Google Drive'a Giriş Yap
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    Fotoğraflarınızı güvenle Google Drive'a yükleyin
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Giriş yapılmışsa normal kamera ekranını göster
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToHome}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Ana Sayfa
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fotoğraf Çek
            </h1>
            <AuthButton />
          </div>
          
          {/* User Info and Limit Display */}
          {isAuthenticated && userInfo && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {userInfo.name || 'Kullanıcı'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {userInfo.email || 'unknown@example.com'}
                    </p>
                  </div>
                </div>
                
                {uploadLimit !== null && uploadLimit !== -1 && (
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
                )}
                
                {uploadLimit === -1 && (
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
            </div>
          )}
        </header>

        <p className="text-gray-600 text-center mb-8">
          Telefonunuzun kamerası ile fotoğraf çekin ve Google Drive'a yükleyin
        </p>

        <main className="bg-white rounded-2xl shadow-xl p-8">
          <CameraContent />
        </main>
      </div>
    </div>
  )
}

function CameraContent() {
  const { capturedImage } = useCamera()

  if (capturedImage) {
    return <ImagePreview />
  }

  return <CameraPlaceholder />
}

function AuthButton() {
  const { isAuthenticated, handleAutoAuth, isLoading } = useCamera()

  const handleLogout = async () => {
    try {
      // Import googleDriveService here to avoid circular dependency
      const { googleDriveService } = await import('../services/googleDrive.js')
      await googleDriveService.signOut()
      
      // Clear localStorage
      localStorage.removeItem('googleDriveFolderId')
      
      // Reload page to reset state
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleLogin = async () => {
    try {
      await handleAutoAuth()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center text-blue-600">
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        İşleniyor...
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center text-red-600 hover:text-red-800 transition-colors"
        title="Çıkış Yap"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Çıkış
      </button>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      title="Google Drive'a Giriş Yap"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      Giriş Yap
    </button>
  )
} 