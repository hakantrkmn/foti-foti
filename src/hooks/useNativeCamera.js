import { useState, useCallback } from 'react'
import { NativeCameraService } from '../services/nativeCamera'

export const useNativeCamera = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deviceInfo, setDeviceInfo] = useState(null)

  const openCamera = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get device info
      const info = NativeCameraService.getDeviceInfo()
      setDeviceInfo(info)
      
      console.log('useNativeCamera: Opening camera for device:', info)
      
      const result = await NativeCameraService.openNativeCamera()
      
      if (result.success) {
        console.log('useNativeCamera: Camera opened successfully')
        return {
          success: true,
          dataUrl: result.dataUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
          mimeType: result.mimeType
        }
      } else {
        console.error('useNativeCamera: Camera failed:', result.error)
        setError(result.error)
        return {
          success: false,
          error: result.error
        }
      }
    } catch (error) {
      console.error('useNativeCamera: Error:', error)
      setError('Kamera açılırken bir hata oluştu: ' + error.message)
      return {
        success: false,
        error: error.message
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkPermissions = useCallback(async () => {
    try {
      const permission = await NativeCameraService.checkCameraPermission()
      return permission
    } catch (error) {
      console.error('useNativeCamera: Permission check failed:', error)
      return 'unknown'
    }
  }, [])

  const requestPermissions = useCallback(async () => {
    try {
      const granted = await NativeCameraService.requestCameraPermission()
      return granted
    } catch (error) {
      console.error('useNativeCamera: Permission request failed:', error)
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    openCamera,
    checkPermissions,
    requestPermissions,
    clearError,
    isLoading,
    error,
    deviceInfo
  }
} 