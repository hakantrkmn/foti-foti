export class NativeCameraService {
  static async openNativeCamera() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    if (!isMobile) {
      // Desktop için fallback
      return this.openFileInput();
    }

    if (isIOS) {
      return this.openIOSNativeCamera();
    } else if (isAndroid) {
      return this.openAndroidNativeCamera();
    }
  }

  static async openIOSNativeCamera() {
    return new Promise((resolve) => {
      // iOS için gelişmiş native kamera açma
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment';
      cameraInput.style.display = 'none';
      
      // iOS'ta gerçek native kamera deneyimi için özel ayarlar
      cameraInput.setAttribute('data-ios-camera', 'true');
      cameraInput.setAttribute('data-camera-mode', 'full');
      
      // iOS'ta daha iyi kamera deneyimi için
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        // iOS'ta gerçek native kamera uygulamasını açmak için
        cameraInput.setAttribute('capture', 'environment');
        cameraInput.setAttribute('accept', 'image/*');
      }
      
      document.body.appendChild(cameraInput);

      const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              success: true,
              dataUrl: e.target.result,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type
            });
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Fotoğraf okunamadı'
            });
          };
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
      // Android için özel native kamera açma
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment';
      cameraInput.style.display = 'none';
      
      // Android'de daha iyi native kamera deneyimi için
      cameraInput.setAttribute('data-android-camera', 'true');
      
      document.body.appendChild(cameraInput);

      const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              success: true,
              dataUrl: e.target.result,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type
            });
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Fotoğraf okunamadı'
            });
          };
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
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      document.body.appendChild(fileInput);

      const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              success: true,
              dataUrl: e.target.result,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type
            });
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Fotoğraf okunamadı'
            });
          };
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
        return permission.state;
      } catch (error) {
        console.log('Permission API not supported');
        return 'unknown';
      }
    }
    return 'unknown';
  }

  static async requestCameraPermission() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (error) {
        console.log('Camera permission denied:', error);
        return false;
      }
    }
    return false;
  }
} 