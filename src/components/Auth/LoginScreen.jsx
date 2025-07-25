import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [folderId, setFolderId] = useState('')
  const [inputError, setInputError] = useState('')
  const navigate = useNavigate()

  const handlePhotoUpload = () => {
    setShowFolderInput(true)
  }

  const handleFolderIdSubmit = () => {
    if (!folderId.trim()) {
      setInputError('Lütfen klasör ID\'sini girin.')
      return
    }
    
    setInputError('')
    setIsLoading(true)
    navigate(`/upload?folderId=${encodeURIComponent(folderId.trim())}`)
    setIsLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!showFolderInput ? (
            <>
              <header className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Foti Foti
                </h1>
                <p className="text-gray-600">
                  Fotoğraf çekme ve paylaşma uygulaması
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
                  Fotoğraf Yükle
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
                  Klasör Oluştur
                </button>
              </div>

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Fotoğraflarınızı güvenle Google Drive'a yükleyin</p>
              </div>
            </>
          ) : (
            <>
              <header className="text-center mb-8">
                <button
                  onClick={handleBackToMain}
                  className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Geri
                </button>
                
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Klasör ID Girin
                </h1>
                <p className="text-gray-600">
                  Fotoğraf yüklemek istediğiniz klasörün ID'sini girin
                </p>
              </header>

              <div className="space-y-4">
                <div>
                  <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 mb-2">
                    Google Drive Klasör ID
                  </label>
                  <input
                    type="text"
                    id="folderId"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="1ABC123DEF456..."
                    className="
                      w-full px-4 py-3 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      placeholder-gray-400
                    "
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleFolderIdSubmit()
                      }
                    }}
                  />
                  {inputError && (
                    <p className="mt-2 text-sm text-red-600">{inputError}</p>
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
                      Yönlendiriliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Fotoğraf Yükleme Sayfasına Git
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Klasör ID'sini nereden bulacağınızı bilmiyor musunuz?</p>
                <p className="mt-1">
                  <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                    Yardım alın
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