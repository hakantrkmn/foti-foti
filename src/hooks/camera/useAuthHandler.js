
import { useState, useEffect, useCallback } from 'react';
import { googleDriveService } from '../../services/googleDrive';
import { useAnalytics } from '../useAnalytics';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';

export const useAuthHandler = (isGoogleDriveInitialized) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const { trackUserLogin } = useAnalytics();

  useEffect(() => {
    const savedUserInfo = storage.getUserInfo();
    const savedAuthToken = storage.getAuthToken();
    if (savedUserInfo && savedAuthToken) {
      logger.log('useAuthHandler: Found saved user info');
      setUserInfo(savedUserInfo);
      setIsAuthenticated(true);
      googleDriveService.setAccessToken(savedAuthToken);
    }
  }, []);

  const handleAutoAuth = useCallback(async () => {
    if (!isGoogleDriveInitialized) {
      logger.info('useAuthHandler: Google Drive not ready for auth');
      setError('Google Drive henüz hazır değil, lütfen bekleyin.');
      return;
    }

    logger.info('useAuthHandler: Starting auto auth...');
    setIsLoading(true);
    setError(null);
    setAuthStatus('Google Drive\'a giriş yapılıyor...');

    try {
      const authResult = await googleDriveService.authenticate();
      logger.info('useAuthHandler: Authentication successful!');
      setIsAuthenticated(true);

      if (authResult.userInfo) {
        setUserInfo(authResult.userInfo);
        storage.setUserInfo(authResult.userInfo);
        if (authResult.accessToken) {
          storage.setAuthToken(authResult.accessToken);
        }
        trackUserLogin('google');
      }

      setError(null);
      setAuthStatus({
        type: 'success',
        message: 'Giriş başarılı! Artık fotoğraf yükleyebilirsiniz.',
      });

      setTimeout(() => setAuthStatus(null), 3000);
    } catch (error) {
      logger.error('useAuthHandler: Auto auth failed:', error);
      let errorMessage = 'Otomatik giriş başarısız: ' + error.message;
      setError(errorMessage);
      setAuthStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleDriveInitialized, trackUserLogin]);

  const logout = () => {
    logger.info('useAuthHandler: Logging out user');
    storage.clearUserData();
    if (window.gapi && window.gapi.auth2) {
      const auth2 = window.gapi.auth2.getAuthInstance();
      if (auth2) {
        auth2.signOut();
      }
    }
    setIsAuthenticated(false);
    setUserInfo(null);
    setError(null);
    setAuthStatus(null);
  };

  return {
    isAuthenticated,
    userInfo,
    isLoading,
    error,
    authStatus,
    handleAutoAuth,
    logout,
    setIsAuthenticated, 
    setUserInfo
  };
}; 