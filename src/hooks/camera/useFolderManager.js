
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FirebaseService } from '../../services/firebase';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';

export const useFolderManager = (initialFolderId) => {
  const [folderId, setFolderId] = useState(initialFolderId || '');
  const [uploadLimit, setUploadLimit] = useState(null);
  const [currentUploadCount, setCurrentUploadCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const loadFirebaseData = useCallback(async (currentFolderId, userId) => {
    try {
      logger.info('useFolderManager: Loading Firebase data for user:', userId);
      const createResult = await FirebaseService.createUserRecord(currentFolderId, userId);
      if (createResult.success) {
        const limitResult = await FirebaseService.checkUserUploadLimit(currentFolderId, userId);
        if (limitResult.success) {
          setCurrentUploadCount(limitResult.currentCount);
          storage.setFolderInfo(currentFolderId, uploadLimit, limitResult.currentCount);
        } else {
          setCurrentUploadCount(0);
          storage.setFolderInfo(currentFolderId, uploadLimit, 0);
        }
      } else {
        setCurrentUploadCount(0);
      }
    } catch (error) {
      logger.error('useFolderManager: Load Firebase data error:', error);
      setCurrentUploadCount(0);
    }
  }, [uploadLimit]);

  const validateHashAndLoadLimit = useCallback(async (currentFolderId, hash) => {
    try {
      const result = await FirebaseService.validateHash(currentFolderId, hash);
      if (result.success && result.isValid) {
        setUploadLimit(result.folderData.limit);
      } else {
        const folderResult = await FirebaseService.getFolder(currentFolderId);
        if (folderResult.success) {
          setUploadLimit(folderResult.data.limit);
        } else {
          setError('QR code is invalid or expired.');
        }
      }
    } catch (error) {
      logger.error('useFolderManager: Hash validation error:', error);
        setError('Limit bilgileri yüklenirken hata oluştu.');
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const loadFolderInfoDirectly = useCallback(async (currentFolderId) => {
    try {
      logger.log('useFolderManager: Loading folder info directly from Firebase for folderId:', currentFolderId);
      setIsLoading(true);
      setError(null);
      
      const result = await FirebaseService.getFolder(currentFolderId);
      logger.log('useFolderManager: Firebase getFolder result:', result);
      
      if (result.success) {
        logger.log('useFolderManager: Folder found, setting data');
        setUploadLimit(result.data.limit);
        setError(null);
      } else {
        logger.log('useFolderManager: Folder not found, setting error:', result.error);
        setError(result.error || 'Klasör bulunamadı');
        setUploadLimit(null);
      }
    } catch (error) {
      logger.error('useFolderManager: Load folder info error:', error);
      setError('Klasör bilgileri yüklenirken bir hata oluştu.');
      setUploadLimit(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlFolderId = searchParams.get('folderId');
    logger.log('useFolderManager: useEffect triggered');
    logger.log('useFolderManager: urlFolderId from searchParams:', urlFolderId);
    logger.log('useFolderManager: initialFolderId:', initialFolderId);
    
    if (urlFolderId) {
        logger.log('useFolderManager: Setting folderId from URL:', urlFolderId);
        setFolderId(urlFolderId);
        const hash = searchParams.get('hash');
        if (hash) {
            logger.log('useFolderManager: Hash found, calling validateHashAndLoadLimit');
            validateHashAndLoadLimit(urlFolderId, hash);
        } else {
            logger.log('useFolderManager: No hash, calling loadFolderInfoDirectly');
            loadFolderInfoDirectly(urlFolderId);
        }
    } else if (!initialFolderId) {
        logger.log('useFolderManager: No folderId in URL and no initialFolderId, setting error');
        setError('Folder ID not found. Please scan the QR code again.');
        setIsLoading(false);
    } else {
        logger.log('useFolderManager: No folderId in URL but initialFolderId exists, setting loading to false');
        setIsLoading(false);
    }
  }, [searchParams, initialFolderId, validateHashAndLoadLimit, loadFolderInfoDirectly]);

  return {
    folderId,
    uploadLimit,
    currentUploadCount,
    error,
    isLoading,
    loadFirebaseData,
    setCurrentUploadCount
  };
}; 