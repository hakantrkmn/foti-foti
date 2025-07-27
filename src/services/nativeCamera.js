import { logger } from '../utils/logger.js'

export class NativeCameraService {
  static async openNativeCamera() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    if (!isMobile) {
      // Desktop için fallback
      return this.openFileInput();
    }

    // Direct native camera app launch - NO browser camera
    if (isIOS) {
      return this.openIOSNativeCamera();
    } else if (isAndroid) {
      return this.openAndroidNativeCamera();
    }
  }



  static async openIOSNativeCamera() {
    return new Promise((resolve) => {
      logger.log('NativeCameraService: Opening iOS native camera app');
      
      // iOS için native kamera uygulamasını açmak - SADECE native app
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment'; // iOS'ta native kamera uygulamasını açar
      cameraInput.style.display = 'none';
      
      // iOS Safari'de SADECE native kamera uygulamasını açmak için
      // Bu kombinasyon iOS'ta native kamera uygulamasını zorlar
      cameraInput.setAttribute('capture', 'environment');
      cameraInput.setAttribute('accept', 'image/*');
      
      // iOS'ta tarayıcı kamerasını devre dışı bırak, sadece native app aç
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        // Bu iOS'ta kesinlikle native kamera uygulamasını açar
        cameraInput.setAttribute('capture', 'camera');
      }
      
      document.body.appendChild(cameraInput);

      const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
          // NO COMPRESSION - Direct file usage to preserve original quality
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              success: true,
              dataUrl: e.target.result,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              originalFile: file, // Original file preserved - NO COMPRESSION
              quality: 'original' // Original quality maintained
            });
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Fotoğraf okunamadı'
            });
          };
          // NO COMPRESSION - Read file without any quality loss
          reader.readAsDataURL(file);
        } else {
          resolve({
            success: false,
            error: 'Fotoğraf seçilmedi'
          });
        }
        
        // Cleanup
        document.body.removeChild(cameraInput);
        cameraInput.removeEventListener('change', handleFileSelect);
      };

      cameraInput.addEventListener('change', handleFileSelect);
      cameraInput.click();
    });
  }

  static async openAndroidNativeCamera() {
    return new Promise((resolve) => {
      logger.log('NativeCameraService: Opening Android native camera app');
      
      // Android için native kamera uygulamasını açmak - SADECE native app
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment'; // Android'de native kamera uygulamasını açar
      cameraInput.style.display = 'none';
      
      // Android Chrome'da SADECE native kamera uygulamasını açmak için
      // Bu kombinasyon Android'de native kamera uygulamasını zorlar
      cameraInput.setAttribute('capture', 'environment');
      cameraInput.setAttribute('accept', 'image/*');
      
      // Android'de tarayıcı kamerasını devre dışı bırak, sadece native app aç
      if (navigator.userAgent.includes('Android')) {
        // Bu Android'de kesinlikle native kamera uygulamasını açar
        cameraInput.setAttribute('capture', 'camera');
      }
      
      document.body.appendChild(cameraInput);

      const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
          // NO COMPRESSION - Direct file usage to preserve original quality
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              success: true,
              dataUrl: e.target.result,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              originalFile: file, // Original file preserved - NO COMPRESSION
              quality: 'original' // Original quality maintained
            });
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Fotoğraf okunamadı'
            });
          };
          // NO COMPRESSION - Read file without any quality loss
          reader.readAsDataURL(file);
        } else {
          resolve({
            success: false,
            error: 'Fotoğraf seçilmedi'
          });
        }
        
        // Cleanup
        document.body.removeChild(cameraInput);
        cameraInput.removeEventListener('change', handleFileSelect);
      };

      cameraInput.addEventListener('change', handleFileSelect);
      cameraInput.click();
    });
  }

  static openFileInput() {
    return new Promise((resolve) => {
      logger.log('NativeCameraService: Opening desktop file input');
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      document.body.appendChild(fileInput);

      const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
          // NO COMPRESSION - Direct file usage to preserve original quality
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              success: true,
              dataUrl: e.target.result,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              originalFile: file, // Original file preserved - NO COMPRESSION
              quality: 'original' // Original quality maintained
            });
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Fotoğraf okunamadı'
            });
          };
          // NO COMPRESSION - Read file without any quality loss
          reader.readAsDataURL(file);
        } else {
          resolve({
            success: false,
            error: 'Fotoğraf seçilmedi'
          });
        }
        
        // Cleanup
        document.body.removeChild(fileInput);
        fileInput.removeEventListener('change', handleFileSelect);
      };

      fileInput.addEventListener('change', handleFileSelect);
      fileInput.click();
    });
  }

  // Gelişmiş kamera özellikleri için yardımcı fonksiyonlar
  static getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    return {
      isIOS,
      isAndroid,
      isMobile,
      userAgent
    };
  }

  static async checkCameraPermission() {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' });
        logger.log('NativeCameraService: Camera permission state:', permission.state);
        return permission.state;
      } catch (error) {
        logger.log('NativeCameraService: Permission API not supported');
        return 'unknown';
      }
    }
    return 'unknown';
  }

  static async requestCameraPermission() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        logger.log('NativeCameraService: Requesting camera permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        stream.getTracks().forEach(track => track.stop());
        logger.log('NativeCameraService: Camera permission granted');
        return true;
      } catch (error) {
        logger.log('NativeCameraService: Camera permission denied:', error);
        return false;
      }
    }
    return false;
  }

  static async getCameraCapabilities() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        logger.log('NativeCameraService: Available cameras:', cameras.length);
        return {
          hasCamera: cameras.length > 0,
          cameraCount: cameras.length,
          cameras: cameras.map(cam => ({
            id: cam.deviceId,
            label: cam.label || 'Camera'
          }))
        };
      }
    } catch (error) {
      logger.error('NativeCameraService: Error getting camera capabilities:', error);
    }
    
    return {
      hasCamera: false,
      cameraCount: 0,
      cameras: []
    };
  }
} 