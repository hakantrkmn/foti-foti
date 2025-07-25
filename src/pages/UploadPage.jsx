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
  const { isAuthenticated, handleAutoAuth, isLoading, error } = useCamera()

  // Otomatik giriş özelliği kaldırıldı - timeout sorunu nedeniyle

  // Hata varsa hata ekranını göster
  if (error) {
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
              
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Hata Oluştu
              </h1>
              <p className="text-gray-600">
                {error}
              </p>
            </header>

            <div className="text-center space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="
                  w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600
                  rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-blue-300
                "
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sayfayı Yenile
              </button>
              
              <button
                onClick={onBackToHome}
                className="
                  w-full flex items-center justify-center px-6 py-3 text-gray-600 bg-gray-100
                  rounded-lg hover:bg-gray-200 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-gray-300
                "
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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