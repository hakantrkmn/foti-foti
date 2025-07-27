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

    // First try Media Capture API for true native camera experience
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        logger.log('NativeCameraService: Attempting Media Capture API...');
        return await this.openMediaCaptureCamera();
      } catch (error) {
        logger.warn('NativeCameraService: Media Capture API failed, falling back to file input:', error);
      }
    }

    // Fallback to file input with optimized attributes
    if (isIOS) {
      return this.openIOSNativeCamera();
    } else if (isAndroid) {
      return this.openAndroidNativeCamera();
    }
  }

  static async openMediaCaptureCamera() {
    return new Promise(async (resolve) => {
      let stream = null;
      let video = null;
      let canvas = null;
      let overlay = null;

      try {
        // Request camera access with high quality settings
        const constraints = {
          video: {
            facingMode: 'environment', // Back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 16/9 }
          },
          audio: false
        };

        logger.log('NativeCameraService: Requesting camera access...');
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Create fullscreen camera overlay
        overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: black;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `;

        // Create video element
        video = document.createElement('video');
        video.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.srcObject = stream;

        // Create camera controls
        const controls = document.createElement('div');
        controls.style.cssText = `
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
          align-items: center;
        `;

        // Capture button
        const captureBtn = document.createElement('button');
        captureBtn.innerHTML = `
          <div style="
            width: 70px;
            height: 70px;
            border: 4px solid white;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="
              width: 50px;
              height: 50px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `;
        captureBtn.style.cssText = `
          background: none;
          border: none;
          cursor: pointer;
        `;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = `
          <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        `;
        closeBtn.style.cssText = `
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(0,0,0,0.5);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        // Add elements to DOM
        controls.appendChild(captureBtn);
        overlay.appendChild(video);
        overlay.appendChild(controls);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        // Wait for video to be ready
        await new Promise((resolve) => {
          video.addEventListener('loadedmetadata', resolve);
        });

        logger.log('NativeCameraService: Camera stream ready');

        // Capture photo function
        const capturePhoto = () => {
          try {
            // Create canvas for photo capture
            canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Set canvas size to video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert to blob with high quality
            canvas.toBlob((blob) => {
              if (blob) {
                const fileName = `photo_${Date.now()}.jpg`;
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                
                // Create data URL for preview
                const reader = new FileReader();
                reader.onload = (e) => {
                  cleanup();
                  resolve({
                    success: true,
                    dataUrl: e.target.result,
                    fileName: fileName,
                    fileSize: file.size,
                    mimeType: file.type,
                    originalFile: file,
                    quality: 'original'
                  });
                };
                reader.readAsDataURL(file);
              } else {
                cleanup();
                resolve({
                  success: false,
                  error: 'Fotoğraf oluşturulamadı'
                });
              }
            }, 'image/jpeg', 0.95); // High quality JPEG
            
          } catch (error) {
            logger.error('NativeCameraService: Capture error:', error);
            cleanup();
            resolve({
              success: false,
              error: 'Fotoğraf çekilemedi: ' + error.message
            });
          }
        };

        // Cleanup function
        const cleanup = () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        };

        // Event listeners
        captureBtn.addEventListener('click', capturePhoto);
        closeBtn.addEventListener('click', () => {
          cleanup();
          resolve({
            success: false,
            error: 'Kamera kapatıldı'
          });
        });

        // Handle escape key
        const handleKeyPress = (e) => {
          if (e.key === 'Escape') {
            document.removeEventListener('keydown', handleKeyPress);
            cleanup();
            resolve({
              success: false,
              error: 'Kamera kapatıldı'
            });
          }
        };
        document.addEventListener('keydown', handleKeyPress);

      } catch (error) {
        logger.error('NativeCameraService: Media Capture setup error:', error);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        
        // Re-throw to trigger fallback
        throw error;
      }
    });
  }

  static async openIOSNativeCamera() {
    return new Promise((resolve) => {
      logger.log('NativeCameraService: Using iOS file input fallback');
      
      // iOS için optimize edilmiş native kamera açma
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment'; // Force camera app
      cameraInput.style.display = 'none';
      
      // iOS Safari için özel optimizasyonlar
      cameraInput.setAttribute('capture', 'camera');
      cameraInput.setAttribute('accept', 'image/*,image/heic,image/heif');
      
      // iOS'ta native kamera uygulamasını zorlamak için
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        cameraInput.setAttribute('data-camera-source', 'camera');
        cameraInput.setAttribute('data-camera-facing', 'environment');
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
      logger.log('NativeCameraService: Using Android file input fallback');
      
      // Android için optimize edilmiş native kamera açma
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment'; // Force camera app
      cameraInput.style.display = 'none';
      
      // Android Chrome için özel optimizasyonlar
      cameraInput.setAttribute('capture', 'camera');
      cameraInput.setAttribute('accept', 'image/*,image/webp');
      
      // Android'de native kamera uygulamasını zorlamak için
      if (navigator.userAgent.includes('Android')) {
        cameraInput.setAttribute('data-camera-source', 'camera');
        cameraInput.setAttribute('data-camera-facing', 'environment');
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