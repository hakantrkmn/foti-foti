// LocalStorage utility functions
const STORAGE_KEYS = {
  USER_INFO: 'foti_foti_user_info',
  AUTH_TOKEN: 'foti_foti_auth_token',
  FOLDER_ID: 'foti_foti_folder_id',
  UPLOAD_LIMIT: 'foti_foti_upload_limit',
  UPLOAD_COUNT: 'foti_foti_upload_count'
}

export const storage = {
  // User info storage
  setUserInfo: (userInfo) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    } catch (error) {
      console.error('Failed to save user info to localStorage:', error)
    }
  },

  getUserInfo: () => {
    try {
      const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error('Failed to get user info from localStorage:', error)
      return null
    }
  },

  // Auth token storage
  setAuthToken: (token) => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    } catch (error) {
      console.error('Failed to save auth token to localStorage:', error)
    }
  },

  getAuthToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    } catch (error) {
      console.error('Failed to get auth token from localStorage:', error)
      return null
    }
  },

  // Folder info storage
  setFolderInfo: (folderId, limit, count) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDER_ID, folderId)
      localStorage.setItem(STORAGE_KEYS.UPLOAD_LIMIT, limit?.toString() || '')
      localStorage.setItem(STORAGE_KEYS.UPLOAD_COUNT, count?.toString() || '0')
    } catch (error) {
      console.error('Failed to save folder info to localStorage:', error)
    }
  },

  getFolderInfo: () => {
    try {
      const folderId = localStorage.getItem(STORAGE_KEYS.FOLDER_ID)
      const limit = localStorage.getItem(STORAGE_KEYS.UPLOAD_LIMIT)
      const count = localStorage.getItem(STORAGE_KEYS.UPLOAD_COUNT)
      
      return {
        folderId: folderId || null,
        limit: limit ? parseInt(limit) : null,
        count: count ? parseInt(count) : 0
      }
    } catch (error) {
      console.error('Failed to get folder info from localStorage:', error)
      return { folderId: null, limit: null, count: 0 }
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      console.log('All localStorage data cleared')
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  },

  // Clear user data only
  clearUserData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      console.log('User data cleared from localStorage')
    } catch (error) {
      console.error('Failed to clear user data from localStorage:', error)
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const userInfo = storage.getUserInfo()
    const authToken = storage.getAuthToken()
    return !!(userInfo && authToken)
  }
} 