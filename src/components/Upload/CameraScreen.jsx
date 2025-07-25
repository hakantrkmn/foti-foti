
import React from 'react';
import { useCamera, AuthButton, ImagePreview, CameraPlaceholder } from '../Camera';
import { DarkModeToggle } from '../DarkModeToggle';

const CameraContent = () => {
  const { capturedImage } = useCamera();
  if (capturedImage) {
    return <ImagePreview />;
  }
  return <CameraPlaceholder />;
};

export const CameraScreen = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToHome}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm">Home</span>
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Take Photo
            </h1>
            <div className="flex items-center space-x-2">
              <DarkModeToggle />
              <AuthButton />
            </div>
          </div>
        </header>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 sm:mb-8">
          Take photos with your phone camera and upload to Google Drive
        </p>

        <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
          <CameraContent />
        </main>
      </div>
    </div>
  );
}; 