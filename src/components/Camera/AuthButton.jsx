import { useCamera } from '../../hooks/useCamera'

export const AuthButton = () => {
  const { isAuthenticated, userInfo, handleAutoAuth, logout } = useCamera()

  if (isAuthenticated && userInfo) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {userInfo.name || 'Kullanıcı'}
          </span>
        </div>
        <button
          onClick={logout}
          className="
            px-3 py-1 text-sm font-medium text-red-600 bg-red-50
            rounded-lg hover:bg-red-100 transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-300
          "
        >
          Çıkış
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
      Giriş Yap
    </button>
  )
} 