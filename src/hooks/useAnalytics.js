import { track } from '@vercel/analytics'

export const useAnalytics = () => {
  const trackEvent = (eventName, properties = {}) => {
    if (import.meta.env.PROD) {
      track(eventName, properties)
    } else {
      console.log('Analytics Event:', eventName, properties)
    }
  }

  const trackPageView = (pageName) => {
    trackEvent('page_view', { page: pageName })
  }

  const trackPhotoUpload = (folderId, success = true) => {
    trackEvent('photo_upload', { 
      folderId, 
      success,
      timestamp: new Date().toISOString()
    })
  }

  const trackFolderCreation = (folderId, limit) => {
    trackEvent('folder_creation', { 
      folderId, 
      limit,
      timestamp: new Date().toISOString()
    })
  }

  const trackUserLogin = (method = 'google') => {
    trackEvent('user_login', { 
      method,
      timestamp: new Date().toISOString()
    })
  }

  const trackError = (errorType, errorMessage) => {
    trackEvent('error', { 
      type: errorType, 
      message: errorMessage,
      timestamp: new Date().toISOString()
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackPhotoUpload,
    trackFolderCreation,
    trackUserLogin,
    trackError
  }
} 