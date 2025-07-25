import { useContext } from 'react'
import { CameraContext } from '../components/Camera/CameraContext'

export const useCamera = () => {
  const context = useContext(CameraContext)
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider')
  }
  return context
} 