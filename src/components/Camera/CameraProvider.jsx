import { useState, useRef } from 'react'
import { CameraContext } from './CameraContext'

export const CameraProvider = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)

  const openNativeCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setIsLoading(true)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target.result)
        setIsLoading(false)
        setError(null)
      }
      reader.onerror = () => {
        setError('Fotoğraf yüklenirken bir hata oluştu.')
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    }
    
    // Input'u temizle ki aynı dosya tekrar seçilebilsin
    event.target.value = ''
  }

  const resetPhoto = () => {
    setCapturedImage(null)
    setError(null)
  }

  const value = {
    capturedImage,
    isLoading,
    error,
    openNativeCamera,
    resetPhoto
  }

  return (
    <CameraContext.Provider value={value}>
      {children}
      {/* Gizli file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </CameraContext.Provider>
  )
} 