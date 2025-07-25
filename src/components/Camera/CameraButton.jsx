import { useCamera } from '../../hooks/useCamera'

export const CameraButton = () => {
  const { openNativeCamera, isLoading, error } = useCamera()

  return (
    <div className="text-center">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in">
          {error}
        </div>
      )}
      
      <button
        onClick={openNativeCamera}
        disabled={isLoading}
        className={`
          relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium
          text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full
          shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          focus:outline-none focus:ring-4 focus:ring-blue-300
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Fotoğraf Yükleniyor...
          </>
        ) : (
          <>
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Fotoğraf Çek
          </>
        )}
      </button>
    </div>
  )
} 