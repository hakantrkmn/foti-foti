import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCamera } from '../components/Camera';
import { ErrorScreen } from '../components/Upload/ErrorScreen';
import { LoginPromptScreen } from '../components/Upload/LoginPromptScreen';
import { CameraScreen } from '../components/Upload/CameraScreen';
import { logger } from '../utils/logger.js';

const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

export const UploadPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, handleAutoAuth, isLoading, error } = useCamera();

  const folderId = searchParams.get('folderId');

  if (!folderId) {
    logger.log('UploadPage: No folderId in URL, redirecting to home');
    navigate('/', { replace: true });
    return null;
  }

  const handleBackToHome = () => navigate('/');
  const handleRetry = () => window.location.reload();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} onBackToHome={handleBackToHome} />;
  }

  if (!isAuthenticated) {
    return <LoginPromptScreen onLogin={handleAutoAuth} onBackToHome={handleBackToHome} isLoading={isLoading} />;
  }

  return <CameraScreen onBackToHome={handleBackToHome} />;
};

 