
import React from 'react';
import { DarkModeToggle } from '../DarkModeToggle';

export const ErrorScreen = ({ error, onRetry, onBackToHome }) => {
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                Error Occurred
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {error}
              </p>
            </div>
          </header>

          <div className="text-center space-y-3 sm:space-y-4">
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm sm:text-base">Refresh Page</span>
            </button>
            
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
              <span className="text-sm sm:text-base">Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 