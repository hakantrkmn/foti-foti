import { useCamera } from './CameraProvider'

export const CameraView = () => {
  const { 
    videoRef, 
    capturePhoto, 
    closeCamera 
  } = useCamera()

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          className="w-full rounded-xl shadow-2xl"
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl pointer-events-none" />
      </div>
      
      <div className="flex gap-4 justify-center mt-6">
        <button
          onClick={capturePhoto}
          className="
            flex items-center px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600
            rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-green-300
          "
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Fotoğraf Çek
        </button>
        
        <button
          onClick={closeCamera}
          className="
            flex items-center px-6 py-3 text-white bg-gradient-to-r from-red-500 to-red-600
            rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-red-300
          "
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Kapat
        </button>
      </div>
    </div>
  )
} 