import { createContext, useContext, useState, useRef } from 'react'

const CameraContext = createContext()

export const useCamera = () => {
  const context = useContext(CameraContext)
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider')
  }
  return context
}

export const CameraProvider = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const openCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (error) {
      console.error('Kamera erişimi hatası:', error)
      setError('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageData)
      closeCamera()
    }
  }

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)
  }

  const resetPhoto = () => {
    setCapturedImage(null)
    setError(null)
  }

  const value = {
    capturedImage,
    isCameraOpen,
    isLoading,
    error,
    videoRef,
    canvasRef,
    openCamera,
    capturePhoto,
    closeCamera,
    resetPhoto
  }

  return (
    <CameraContext.Provider value={value}>
      {children}
      {/* Gizli canvas element */}
      <canvas ref={canvasRef} className="hidden" />
    </CameraContext.Provider>
  )
} 