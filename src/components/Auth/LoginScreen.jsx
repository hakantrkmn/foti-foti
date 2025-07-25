import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handlePhotoUpload = () => {
    setIsLoading(true)
    navigate('/upload')
    setIsLoading(false)
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
        </div>
      </div>
    </div>
  )
} 