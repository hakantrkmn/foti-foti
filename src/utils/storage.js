// LocalStorage utility functions
import { logger } from './logger.js'

const STORAGE_KEYS = {
  USER_INFO: 'foti_foti_user_info',
  AUTH_TOKEN: 'foti_foti_auth_token',
  REFRESH_TOKEN: 'foti_foti_refresh_token',
  TOKEN_EXPIRY: 'foti_foti_token_expiry',
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
      logger.error('Failed to save user info to localStorage:', error)
    }
  },

  getUserInfo: () => {
    try {
      const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      logger.error('Failed to get user info from localStorage:', error)
      return null
    }
  },

  // Auth token storage
  setAuthToken: (token, refreshToken = null, expiry = null) => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      }
      if (expiry) {
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toISOString())
      }
    } catch (error) {
      logger.error('Failed to save auth token to localStorage:', error)
    }
  },

  getAuthToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    } catch (error) {
      logger.error('Failed to get auth token from localStorage:', error)
      return null
    }
  },

  getRefreshToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    } catch (error) {
      logger.error('Failed to get refresh token from localStorage:', error)
      return null
    }
  },

  getTokenExpiry: () => {
    try {
      const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
      return expiry ? new Date(expiry) : null
    } catch (error) {
      logger.error('Failed to get token expiry from localStorage:', error)
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
      logger.error('Failed to save folder info to localStorage:', error)
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
      logger.error('Failed to get folder info from localStorage:', error)
      return { folderId: null, limit: null, count: 0 }
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      logger.log('All localStorage data cleared')
    } catch (error) {
      logger.error('Failed to clear localStorage:', error)
    }
  },

  // Clear user data only
  clearUserData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)
      logger.log('User data cleared from localStorage')
    } catch (error) {
      logger.error('Failed to clear user data from localStorage:', error)
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const userInfo = storage.getUserInfo()
    const authToken = storage.getAuthToken()
    return !!(userInfo && authToken)
  }
} 