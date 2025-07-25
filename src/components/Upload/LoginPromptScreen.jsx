
import React from 'react';
import { DarkModeToggle } from '../DarkModeToggle';

export const LoginPromptScreen = ({ onLogin, onBackToHome, isLoading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-4 sm:py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 relative">
          <div className="absolute top-4 right-4">
            <DarkModeToggle />
          </div>

          <header className="text-center mb-6 sm:mb-8 relative">
            <button
              onClick={onBackToHome}
              className="absolute top-0 left-0 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
            >
              <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm">Home</span>
            </button>
            
            <div className="pt-8 sm:pt-10">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Google Drive Login
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Sign in to Google Drive to upload photos
              </p>
            </div>
          </header>

          <div className="text-center">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <svg className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Signing in to Google Drive...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={onLogin}
                  className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm sm:text-base">Sign in to Google Drive</span>
                </button>
                
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Upload your photos securely to Google Drive
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 