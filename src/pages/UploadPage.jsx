import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CameraProvider,
  CameraButton,
  ImagePreview,
  CameraPlaceholder,
  AuthButton,
  useCamera
} from '../components/Camera'
import { DarkModeToggle } from '../components/DarkModeToggle'
import React from 'react'
import { logger } from '../utils/logger.js'

export const UploadPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const folderId = searchParams.get('folderId')
  
  // Redirect to home page if no folderId in URL
  if (!folderId) {
    logger.log('UploadPage: No folderId in URL, redirecting to home')
    navigate('/', { replace: true })
    return null
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return <UploadPageContent onBackToHome={handleBackToHome} />
}

function UploadPageContent({ onBackToHome }) {
  const { isAuthenticated, handleAutoAuth, isLoading, error } = useCamera()

  // Otomatik giriş özelliği kaldırıldı - timeout sorunu nedeniyle

  // Hata varsa hata ekranını göster
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-4 sm:py-8 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 relative">
            {/* Dark Mode Toggle */}
            <div className="absolute top-4 right-4">
              <DarkModeToggle />
            </div>

            <header className="text-center mb-6 sm:mb-8 relative">
              {/* Back Button - positioned absolutely to avoid layout conflicts */}
              <button
                onClick={onBackToHome}
                className="absolute top-0 left-0 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
              >
                <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline text-sm">Home</span>
              </button>
              
              {/* Error Icon and Title - with proper spacing */}
              <div className="pt-8 sm:pt-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  Error Occurred
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {error}
                </p>
              </div>
            </header>

            <div className="text-center space-y-3 sm:space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="
                  w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium
                  text-white bg-gradient-to-r from-blue-500 to-purple-600
                  rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-blue-300
                "
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm sm:text-base">Refresh Page</span>
              </button>
              
              <button
                onClick={onBackToHome}
                className="
                  w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium
                  text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                  rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-gray-300
                "
              >
                <span className="text-sm sm:text-base">Back to Home</span>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-4 sm:py-8 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 relative">
            {/* Dark Mode Toggle */}
            <div className="absolute top-4 right-4">
              <DarkModeToggle />
            </div>

            <header className="text-center mb-6 sm:mb-8 relative">
              {/* Back Button - positioned absolutely to avoid layout conflicts */}
              <button
                onClick={onBackToHome}
                className="absolute top-0 left-0 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
              >
                <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline text-sm">Home</span>
              </button>
              
              {/* Main Title - with proper spacing from back button */}
              <div className="pt-8 sm:pt-10">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Google Drive Login
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Sign in to Google Drive to upload photos
                </p>
              </div>
            </header>

            <div className="text-center">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <svg className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Signing in to Google Drive...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleAutoAuth}
                    className="
                      w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium
                      text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl
                      shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                      focus:outline-none focus:ring-4 focus:ring-blue-300
                    "
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm sm:text-base">Sign in to Google Drive</span>
                  </button>
                  
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Upload your photos securely to Google Drive
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show normal camera screen if logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToHome}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm">Home</span>
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Take Photo
            </h1>
            <div className="flex items-center space-x-2">
              <DarkModeToggle />
              <AuthButton />
            </div>
          </div>
          

        </header>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 sm:mb-8">
          Take photos with your phone camera and upload to Google Drive
        </p>

        <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
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

 