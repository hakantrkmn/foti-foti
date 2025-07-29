
import { useState, useEffect, useCallback } from 'react';
import { CameraContext } from './CameraContext';
import { googleDriveService } from '../../services/googleDrive';
import { logger } from '../../utils/logger';

import { useAuthHandler } from '../../hooks/camera/useAuthHandler';
import { useFolderManager } from '../../hooks/camera/useFolderManager';
import { useUploadManager } from '../../hooks/camera/useUploadManager';
import { usePhotoCapture } from '../../hooks/camera/usePhotoCapture';

export const CameraProvider = ({ children, initialFolderId = null }) => {
  const [isGoogleDriveInitialized, setIsGoogleDriveInitialized] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const {
    isAuthenticated,
    userInfo,
    isLoading: isAuthLoading,
    error: authError,
    authStatus,
    handleAutoAuth,
    logout,
  } = useAuthHandler(isGoogleDriveInitialized);
  
  const {
    folderId,
    uploadLimit,
    currentUploadCount,
    error: folderError,
    isLoading: isFolderLoading,
    loadFirebaseData,
    setCurrentUploadCount
  } = useFolderManager(initialFolderId);


  useEffect(() => {
    if (userInfo && folderId) {
      loadFirebaseData(folderId, userInfo.id);
    }
  }, [userInfo, folderId, loadFirebaseData]);


  const onUploadComplete = useCallback(() => {
    setCurrentUploadCount(prev => prev + 1);
  }, [setCurrentUploadCount]);

  const {
    uploadQueue,
    activeUploads,
    uploadHistory,
    uploadToGoogleDrive: performUpload,
  } = useUploadManager(userInfo, uploadLimit, onUploadComplete);

  const {
    capturedImage,
    originalImageFile,
    isLoading: isCaptureLoading,
    error: captureError,
    openNativeCamera,
    resetPhoto,
    setCapturedImage,
  } = usePhotoCapture(folderId);

  useEffect(() => {
    const initGoogleDrive = async () => {
      try {
        logger.log('CameraProvider: Initializing Google Drive service...');
        const initialized = await googleDriveService.initialize();
        setIsGoogleDriveInitialized(initialized);
      } catch (error) {
        logger.error('CameraProvider: Google Drive initialization failed:', error);
        setGlobalError('Google Drive başlatılamadı: ' + error.message);
      }
    };
    initGoogleDrive();
  }, []);
    
  useEffect(() => {
    // Check for auth errors in upload queue
    const hasAuthError = uploadQueue.some(upload => 
      upload.status === 'error' && 
      (upload.isAuthError || upload.error.includes('Oturum süreniz doldu') || upload.error.includes('erişim izniniz geçersiz') || upload.error.includes('yeniden giriş'))
    );
    
    if (hasAuthError) {
      setGlobalError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
    } else {
      setGlobalError(authError || folderError || captureError);
    }
  }, [authError, folderError, captureError, uploadQueue]);

  const handleUpload = () => {
    if (capturedImage && userInfo) {
      performUpload(capturedImage, originalImageFile, folderId);
      setCapturedImage(null); 
    }
  };

           const value = {
    // States
           capturedImage,
           originalImageFile,
    isLoading: isAuthLoading || isFolderLoading || isCaptureLoading,
    error: globalError,
           isGoogleDriveInitialized,
    uploadStatus: authStatus, 
           folderId,
           isAuthenticated,
           userInfo,
           uploadQueue,
           activeUploads,
           uploadHistory,
           uploadLimit,
           currentUploadCount,
    
    // Functions
           openNativeCamera,
    uploadToGoogleDrive: handleUpload,
           resetPhoto,
           handleAutoAuth,
    logout,
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
}; 