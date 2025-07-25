import { useCamera } from './CameraProvider'

export const ImagePreview = () => {
  const { capturedImage, resetPhoto } = useCamera()

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
      
      <div className="flex justify-center mt-6">
        <button
          onClick={resetPhoto}
          className="
            flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600
            rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-blue-300
          "
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yeni Fotoğraf Çek
        </button>
      </div>
    </div>
  )
} 