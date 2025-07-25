import { useCamera } from '../../hooks/useCamera'

export const AuthButton = () => {
  const { isAuthenticated, userInfo, handleAutoAuth, logout, uploadQueue } = useCamera()

  // Check if there are authentication errors
  const hasAuthError = uploadQueue.some(upload => 
    upload.status === 'error' && 
    upload.error && 
    (upload.error.includes('erişim izniniz geçersiz') || upload.error.includes('yeniden giriş'))
  )

  if (isAuthenticated && userInfo) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
            {userInfo.name || 'User'}
          </span>
        </div>
        
        {/* Show re-authenticate button if there are auth errors */}
        {hasAuthError && (
          <button
            onClick={handleAutoAuth}
            className="
              px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30
              rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-300
            "
          >
            Sign In Again
          </button>
        )}
        
        <button
          onClick={logout}
          className="
            px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30
            rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-300
          "
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAutoAuth}
      className="
        px-4 py-2 text-sm font-medium text-white bg-blue-500
        rounded-lg hover:bg-blue-600 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-300
      "
    >
      Sign In
    </button>
  )
} 