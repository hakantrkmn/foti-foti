
import { useState } from 'react';
import { googleDriveService } from '../../services/googleDrive';
import { FirebaseService } from '../../services/firebase';
import { useAnalytics } from '../useAnalytics';
import { logger } from '../../utils/logger';

export const useUploadManager = (userInfo, uploadLimit, onUploadComplete) => {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [activeUploads, setActiveUploads] = useState(0);
  const [uploadHistory, setUploadHistory] = useState([]);
  const { trackPhotoUpload, trackError } = useAnalytics();

  const generateFileName = (name) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-');
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-');
    const cleanUsername = name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').replace(/\s+/g, '_').substring(0, 30).trim();
    return `${cleanUsername}_${dateStr}_${timeStr}.jpg`;
  };

  const uploadToGoogleDrive = (capturedImage, originalImageFile, folderId) => {
    if (!capturedImage) return;

    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = generateFileName(userInfo.name);

    const uploadItem = {
      id: uploadId,
      fileName,
      status: 'pending',
      progress: 0,
      error: null,
      startTime: new Date(),
    };

    setUploadQueue(prev => [...prev, uploadItem]);
    setActiveUploads(prev => prev + 1);
    
    processUpload(uploadId, capturedImage, originalImageFile, fileName, folderId);
  };

  const processUpload = async (uploadId, imageData, originalImageFile, fileName, targetFolderId) => {
    try {
      logger.info(`useUploadManager: Starting async upload ${uploadId}`);
      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { ...item, status: 'uploading', progress: 10 } : item));

      // Limit check
      if (uploadLimit !== null && uploadLimit !== -1) {
        const limitResult = await FirebaseService.checkUserUploadLimit(targetFolderId, userInfo.id);
        if (limitResult.success && !limitResult.canUpload) {
          const errorMsg = `Yükleme limitiniz doldu! (${limitResult.currentCount}/${limitResult.limit})`;
          throw new Error(errorMsg);
        }
      }

      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { ...item, progress: 50 } : item));
      const result = await googleDriveService.uploadImage(imageData, fileName, targetFolderId, originalImageFile);

      if (!result.success) throw new Error(result.message || 'Dosya yüklenemedi.');

      logger.info(`useUploadManager: Google Drive upload successful for ${uploadId}`);
      trackPhotoUpload(targetFolderId, true);

      const firebaseResult = await FirebaseService.incrementUserUploadCount(targetFolderId, userInfo.id);
      if (firebaseResult.success) {
        if(onUploadComplete) onUploadComplete();
      }

      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { ...item, status: 'success', progress: 100, fileId: result.fileId, webViewLink: result.webViewLink } : item));
      
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
        setUploadHistory(prev => [...prev, { id: uploadId, fileName, status: 'success' }]);
      }, 5000);

    } catch (error) {
      logger.error(`useUploadManager: Upload error for ${uploadId}:`, error);
      
      // Check if this is an authentication error
      const isAuthError = error.message.includes('Token refresh failed') || 
                         error.message.includes('Authentication failed') ||
                         error.message.includes('Please sign in again') ||
                         error.message.includes('401') ||
                         error.message.includes('unauthorized');
      
      const errorMessage = isAuthError 
        ? 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
        : error.message;
      
      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { 
        ...item, 
        status: 'error', 
        error: errorMessage,
        isAuthError 
      } : item));
      
      trackError('upload_error', errorMessage);
    } finally {
      setActiveUploads(prev => prev - 1);
    }
  };

  return {
    uploadQueue,
    activeUploads,
    uploadHistory,
    uploadToGoogleDrive,
  };
}; 