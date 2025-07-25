
import { useState } from 'react';
import { useNativeCamera } from '../useNativeCamera';
import { useAnalytics } from '../useAnalytics';
import { ImageQualityManager } from '../../utils/imageQuality';
import { logger } from '../../utils/logger';

export const usePhotoCapture = (folderId) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { openCamera } = useNativeCamera();
  const { trackPhotoUpload } = useAnalytics();

  const openNativeCamera = async () => {
    try {
      logger.info('usePhotoCapture: Opening native camera...');
      setIsLoading(true);
      setError(null);
      
      const result = await openCamera();
      
      if (result.success) {
        logger.info('usePhotoCapture: Native camera photo captured successfully');
        setCapturedImage(result.dataUrl);
        
        if (result.originalFile) {
          logger.info('usePhotoCapture: Original file saved for high quality upload');
          setOriginalImageFile(result.originalFile);
          ImageQualityManager.generateQualityReport(result.originalFile)
            .then(report => logger.info('usePhotoCapture: Image quality report:', report));
        }
        
        trackPhotoUpload(folderId, true);
      } else {
        logger.error('usePhotoCapture: Native camera failed:', result.error);
        setError(result.error || 'Kamera açılamadı');
      }
    } catch (error) {
      logger.error('usePhotoCapture: Native camera error:', error);
      setError('Kamera açılırken bir hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPhoto = () => {
    setCapturedImage(null);
    setOriginalImageFile(null);
    setError(null);
  };

  return {
    capturedImage,
    originalImageFile,
    isLoading,
    error,
    openNativeCamera,
    resetPhoto,
    setCapturedImage
  };
}; 