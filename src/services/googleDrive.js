// Google Drive API Service
import { logger } from '../utils/logger.js'
import { storage } from '../utils/storage.js'

class GoogleDriveService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    this.scope = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
    this.discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    this.tokenClient = null
    this.gapiInited = false
    this.gisInited = false
    this.accessToken = null
    this.tokenExpiry = null
    this.refreshToken = null
    
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage()
  }

  loadTokensFromStorage() {
    try {
      this.accessToken = storage.getAuthToken()
      this.refreshToken = storage.getRefreshToken()
      this.tokenExpiry = storage.getTokenExpiry()
      
      if (this.accessToken && this.refreshToken) {
        logger.log('GoogleDriveService: Tokens loaded from localStorage')
      }
    } catch (error) {
      logger.error('GoogleDriveService: Failed to load tokens from localStorage:', error)
    }
  }

  async initialize() {
    try {
      // Load the Google API client library
      await this.loadGapiClient()
      await this.loadGisClient()
      
      if (this.gapiInited && this.gisInited) {
        return true
      }
      return false
    } catch (error) {
      console.error('Google Drive initialization error:', error)
      return false
    }
  }

  async loadGapiClient() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapiInited = true
        resolve()
        return
      }

      logger.log('GoogleDriveService: Loading GAPI client...')
      logger.log('GoogleDriveService: API Key:', this.apiKey ? 'Present' : 'Missing')
      logger.log('GoogleDriveService: Discovery Docs:', this.discoveryDocs)

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
              script.onload = () => {
          logger.log('GoogleDriveService: GAPI script loaded')
          window.gapi.load('client', async () => {
            try {
              logger.log('GoogleDriveService: Initializing GAPI client...')
              await window.gapi.client.init({
                apiKey: this.apiKey,
                discoveryDocs: this.discoveryDocs,
              })
              logger.log('GoogleDriveService: GAPI client initialized successfully')
              this.gapiInited = true
              resolve()
            } catch (error) {
              logger.error('GoogleDriveService: GAPI client initialization failed:', error)
              reject(error)
            }
          })
        }
              script.onerror = (error) => {
          logger.error('GoogleDriveService: Failed to load GAPI script:', error)
          reject(error)
        }
      document.head.appendChild(script)
    })
  }

  async loadGisClient() {
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.gisInited = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scope,
          callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              this.accessToken = tokenResponse.access_token
              // Set token expiry (typically 1 hour from now)
              this.tokenExpiry = new Date(Date.now() + (tokenResponse.expires_in * 1000))
              this.refreshToken = tokenResponse.refresh_token
            }
          },
        })
        this.gisInited = true
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Check if token is expired or about to expire (within 5 minutes)
  isTokenExpired() {
    if (!this.tokenExpiry) return true
    const fiveMinutesFromNow = new Date(Date.now() + (5 * 60 * 1000))
    return this.tokenExpiry <= fiveMinutesFromNow
  }

  // Try to refresh the token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: '', // Not needed for client-side apps
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000))
      
      // Save new token to localStorage
      storage.setAuthToken(data.access_token, this.refreshToken, this.tokenExpiry)
      
      logger.log('GoogleDriveService: Token refreshed successfully')
      return true
    } catch (error) {
      logger.error('GoogleDriveService: Token refresh failed:', error)
      return false
    }
  }

  async authenticate() {
    if (!this.tokenClient) {
      throw new Error('Google Drive not initialized')
    }

    return new Promise((resolve, reject) => {
      let isResolved = false
      
      // Create a one-time callback for this authentication request
      const authCallback = (response) => {
        if (isResolved) {
          return
        }
        
        logger.log('Google auth callback: Processing response', response)
        isResolved = true
        
        if (response.error) {
          logger.log('Google auth callback: Error received:', response.error)
          // Check for specific error types
          if (response.error === 'popup_closed_by_user' || response.error === 'popup_blocked') {
            reject(new Error('Giriş işlemi iptal edildi'))
          } else if (response.error === 'access_denied') {
            reject(new Error('Giriş izni reddedildi'))
          } else if (response.error === 'immediate_failed') {
            reject(new Error('Giriş işlemi başarısız'))
          } else {
            reject(new Error(response.error))
          }
        } else {
          logger.log('Google auth callback: Success, setting access token')
          this.accessToken = response.access_token
          // Set token expiry (typically 1 hour from now)
          this.tokenExpiry = new Date(Date.now() + (response.expires_in * 1000))
          this.refreshToken = response.refresh_token
          
          // Save tokens to localStorage
          storage.setAuthToken(response.access_token, response.refresh_token, this.tokenExpiry)
          
          // Get user info after successful authentication
          this.getUserInfo().then(userInfo => {
            this.userInfo = userInfo
            resolve({ accessToken: response.access_token, userInfo })
          }).catch(error => {
            logger.error('Failed to get user info:', error)
            resolve({ accessToken: response.access_token, userInfo: null })
          })
        }
      }

      // Set timeout for this specific request
      const timeout = setTimeout(() => {
        if (!isResolved) {
          logger.log('Google auth: Overall timeout after 60 seconds')
          isResolved = true
          reject(new Error('Giriş işlemi zaman aşımına uğradı'))
        }
      }, 60000)

      try {
        logger.log('Google auth: Requesting access token...')
        
        // Create a temporary token client for this request
        const tempTokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scope,
          callback: authCallback,
        })
        
        if (window.gapi.client.getToken() === null) {
          tempTokenClient.requestAccessToken({ prompt: 'consent' })
        } else {
          tempTokenClient.requestAccessToken({ prompt: '' })
        }
      } catch (error) {
        if (!isResolved) {
          clearTimeout(timeout)
          isResolved = true
          reject(new Error('Giriş işlemi başlatılamadı: ' + error.message))
        }
      }
    })
  }

  async getUserInfo() {
    try {
      if (!this.accessToken) {
        throw new Error('No access token available')
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        logger.error('User info response not ok:', response.status, response.statusText)
        throw new Error(`Failed to get user info: ${response.status}`)
      }

      const userInfo = await response.json()
      
      // Generate a unique ID if Google doesn't provide one
      const userId = userInfo.id || userInfo.sub || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        id: userId,
        email: userInfo.email || 'unknown@example.com',
        name: userInfo.name || 'Unknown User',
        picture: userInfo.picture || null
      }
    } catch (error) {
      logger.error('Get user info error:', error)
      
      // Return a fallback user info if we can't get it from Google
      const fallbackId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        id: fallbackId,
        email: 'unknown@example.com',
        name: 'Unknown User',
        picture: null
      }
    }
  }

  async uploadImage(imageData, fileName, folderId, originalFile = null) {
    try {
      // Check if token is expired and try to refresh
      if (this.isTokenExpired()) {
        logger.log('GoogleDriveService: Token expired, attempting refresh...')
        const refreshSuccess = await this.refreshAccessToken()
        if (!refreshSuccess) {
          throw new Error('Token yenileme başarısız. Lütfen tekrar giriş yapın.')
        }
      }

      let blob, mimeType;
      
      // Eğer orijinal dosya varsa, onu kullan (kalite kaybını önlemek için)
      if (originalFile) {
        logger.log('GoogleDrive: Using original file for upload, size:', originalFile.size, 'type:', originalFile.type);
        blob = originalFile;
        mimeType = originalFile.type;
      } else {
        // Fallback: base64'ten blob oluştur
        logger.log('GoogleDrive: Using base64 data for upload');
        const base64Data = imageData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: 'image/jpeg' });
        mimeType = 'image/jpeg';
      }

      // Create form data
      const metadata = {
        name: fileName,
        parents: [folderId],
        mimeType: mimeType
      }

      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      form.append('file', blob)

      // Upload to Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('Google Drive upload error details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        })
        
        let errorMessage = 'Upload failed'
        if (response.status === 403) {
          errorMessage = 'You do not have permission to write to this folder. Please check the folder ID or contact the folder owner.'
        } else if (response.status === 404) {
          errorMessage = 'Folder not found. Please check the folder ID.'
        } else if (response.status === 401) {
          // Try to refresh token and retry once
          logger.log('GoogleDriveService: 401 error, attempting token refresh and retry...')
          const refreshSuccess = await this.refreshAccessToken()
          if (refreshSuccess) {
            // Retry the upload with new token
            const retryResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              },
              body: form
            })
            
            if (retryResponse.ok) {
              const result = await retryResponse.json()
              return {
                success: true,
                fileId: result.id,
                webViewLink: result.webViewLink,
                message: 'Photo successfully uploaded to Google Drive!'
              }
            } else {
              errorMessage = 'Your Google Drive access is invalid. Please sign in again.'
            }
          } else {
            errorMessage = 'Your Google Drive access is invalid. Please sign in again.'
          }
        } else {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return {
        success: true,
        fileId: result.id,
        webViewLink: result.webViewLink,
        message: 'Photo successfully uploaded to Google Drive!'
      }
    } catch (error) {
      logger.error('Upload error:', error)
      return {
        success: false,
        error: error.message,
        message: 'An error occurred while uploading the photo.'
      }
    }
  }

  setAccessToken(token) {
    this.accessToken = token
  }

  // Validate folder with API key (for public folders)
  async validateFolderWithApiKey(folderId) {
    try {
      const apiKey = this.apiKey;
      if (!apiKey) {
        return {
          success: false,
          error: 'API Key is required for folder validation'
        };
      }

      // Try to get folder info with API key
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?key=${apiKey}&fields=id,name,mimeType,trashed,permissions`, {
        method: 'GET'
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: 'Folder not found. Please check the folder ID.'
          };
        } else if (response.status === 403) {
          return {
            success: false,
            error: 'You do not have access to this folder. The folder might be private.'
          };
        } else {
          return {
            success: false,
            error: `Could not retrieve folder information. Status: ${response.status}`
          };
        }
      }

      const folderData = await response.json();
      
      // Check if it's actually a folder
      if (folderData.mimeType !== 'application/vnd.google-apps.folder') {
        return {
          success: false,
          error: 'This ID does not belong to a folder. Please enter a valid folder ID.'
        };
      }

      // Check if folder is trashed
      if (folderData.trashed) {
        return {
          success: false,
          error: 'This folder is in the trash.'
        };
      }

      // Check if folder is public (has public permissions)
      const isPublic = folderData.permissions && folderData.permissions.some(permission => 
        permission.type === 'anyone' && permission.role === 'writer'
      );

      if (!isPublic) {
        return {
          success: false,
          error: 'This folder is not public. Set the folder to "Anyone with the link can edit".'
        };
      }

      return {
        success: true,
        folderName: folderData.name,
        folderId: folderData.id,
        isPublic: true,
        message: `"${folderData.name}" folder is validated and publicly accessible.`
      };

    } catch (error) {
      logger.error('Folder validation error:', error);
      return {
        success: false,
        error: 'An error occurred during folder validation: ' + error.message
      };
    }
  }

  async signOut() {
    if (window.gapi && window.gapi.auth2) {
      const auth2 = window.gapi.auth2.getAuthInstance()
      if (auth2) {
        await auth2.signOut()
      }
    }
    this.accessToken = null
    this.tokenExpiry = null
    this.refreshToken = null
    
    // Clear tokens from localStorage
    storage.clearUserData()
  }
}

export const googleDriveService = new GoogleDriveService() 