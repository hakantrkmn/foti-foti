import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DarkModeToggle } from '../DarkModeToggle'
import { FirebaseService } from '../../services/firebase';

export const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [folderId, setFolderId] = useState('')
  const [inputError, setInputError] = useState('')
  const navigate = useNavigate()

  const handlePhotoUpload = () => {
    setShowFolderInput(true)
  }

  const handleFolderIdSubmit = async () => {
    if (!folderId.trim()) {
      setInputError('Lütfen klasör ID\'sini girin.')
      return
    }
    
    setInputError('')
    setIsLoading(true)

    try {
        const result = await FirebaseService.getFolder(folderId.trim());
        
        if (result.success) {
            navigate(`/upload?folderId=${encodeURIComponent(folderId.trim())}`);
        } else {
            setInputError(result.error || 'Klasör bulunamadı. Lütfen ID\'yi kontrol edin.');
        }
    } catch {
        setInputError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
        setIsLoading(false);
    }
  }

  const handleBackToMain = () => {
    setShowFolderInput(false)
    setFolderId('')
    setInputError('')
  }

  const handleCreateFolder = () => {
    setIsLoading(true)
    navigate('/create')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-4 sm:py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 relative">
          {/* Dark Mode Toggle */}
          <div className="absolute top-4 right-4">
            <DarkModeToggle />
          </div>

          {!showFolderInput ? (
            <>
              <header className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Foti Foti
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Photo capture and sharing app
                </p>
              </header>

              <div className="space-y-4">
                <button
                  onClick={handlePhotoUpload}
                  disabled={isLoading}
                  className="
                    w-full flex items-center justify-center px-6 py-4 text-lg font-medium
                    text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl
                    shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus:ring-4 focus:ring-blue-300
                  "
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Upload Photo
                </button>

                <button
                  onClick={handleCreateFolder}
                  disabled={isLoading}
                  className="
                    w-full flex items-center justify-center px-6 py-4 text-lg font-medium
                    text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl
                    shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus:ring-4 focus:ring-green-300
                  "
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Folder
                </button>
              </div>

              <div className="mt-6 sm:mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Upload your photos securely to Google Drive</p>
              </div>
            </>
          ) : (
            <>
              <header className="text-center mb-6 sm:mb-8">
                <button
                  onClick={handleBackToMain}
                  className="absolute top-4 left-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
                
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Enter Folder ID
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the ID of the folder where you want to upload photos
                </p>
              </header>

              <div className="space-y-4">
                <div>
                  <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Drive Folder ID
                  </label>
                  <input
                    type="text"
                    id="folderId"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="1ABC123DEF456..."
                    className="
                      w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      placeholder-gray-400 dark:placeholder-gray-500
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    "
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleFolderIdSubmit()
                      }
                    }}
                  />
                  {inputError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{inputError}</p>
                  )}
                </div>

                <button
                  onClick={handleFolderIdSubmit}
                  disabled={isLoading || !folderId.trim()}
                  className="
                    w-full flex items-center justify-center px-6 py-4 text-lg font-medium
                    text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl
                    shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus:ring-4 focus:ring-blue-300
                  "
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking Folder...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="hidden sm:inline">Go to Photo Upload Page</span>
                      <span className="sm:hidden">Continue</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Don't know where to find the folder ID?</p>
                <p className="mt-1">
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
                    Get help
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 