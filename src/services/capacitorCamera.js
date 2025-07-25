import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export class CapacitorCameraService {
  static async openNativeCamera() {
    try {
      console.log('CapacitorCameraService: Opening native camera...')
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      })
      
      console.log('CapacitorCameraService: Camera photo captured successfully')
      
      return {
        success: true,
        dataUrl: image.dataUrl,
        format: image.format,
        webPath: image.webPath
      }
    } catch (error) {
      console.error('CapacitorCameraService: Camera error:', error)
      
      // Handle specific error types
      if (error.message.includes('User cancelled')) {
        return {
          success: false,
          error: 'Kamera işlemi iptal edildi',
          cancelled: true
        }
      }
      
      return {
        success: false,
        error: 'Kamera açılırken bir hata oluştu: ' + error.message
      }
    }
  }

  static async checkPermissions() {
    try {
      const permission = await Camera.checkPermissions()
      return {
        camera: permission.camera === 'granted',
        photos: permission.photos === 'granted'
      }
    } catch (error) {
      console.error('CapacitorCameraService: Permission check error:', error)
      return {
        camera: false,
        photos: false
      }
    }
  }

  static async requestPermissions() {
    try {
      const permission = await Camera.requestPermissions()
      return {
        camera: permission.camera === 'granted',
        photos: permission.photos === 'granted'
      }
    } catch (error) {
      console.error('CapacitorCameraService: Permission request error:', error)
      return {
        camera: false,
        photos: false
      }
    }
  }
} 