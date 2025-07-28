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
    this.needsFrequentReauth = false
    this.refreshTimer = null
    
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage()
  }

  loadTokensFromStorage() {
    try {
      this.accessToken = storage.getAuthToken()
      this.refreshToken = storage.getRefreshToken()
      this.tokenExpiry = storage.getTokenExpiry()
      
      if (this.accessToken && this.refreshToken) {
        logger.log('GoogleDriveService: Tokens loaded from localStorage', {
          hasAccessToken: !!this.accessToken,
          hasRefreshToken: !!this.refreshToken,
          tokenExpiry: this.tokenExpiry ? this.tokenExpiry.toISOString() : 'none',
          isExpired: this.isTokenExpired()
        })
        
        // If token is expired, try to refresh it immediately
        if (this.isTokenExpired()) {
          logger.log('GoogleDriveService: Token is expired, will refresh on next API call')
        }
      } else {
        logger.log('GoogleDriveService: No valid tokens found in localStorage')
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
          // CRITICAL: These parameters are required to get refresh token
          access_type: 'offline',
          include_granted_scopes: true,
          callback: (tokenResponse) => {
            logger.log('GoogleDriveService: Token response received:', {
              hasAccessToken: !!tokenResponse.access_token,
              hasRefreshToken: !!tokenResponse.refresh_token,
              expiresIn: tokenResponse.expires_in
            })
            
            if (tokenResponse && tokenResponse.access_token) {
              this.accessToken = tokenResponse.access_token
              // Set token expiry (typically 1 hour from now)
              this.tokenExpiry = new Date(Date.now() + (tokenResponse.expires_in * 1000))
              this.refreshToken = tokenResponse.refresh_token
              
              if (!this.refreshToken) {
                logger.warn('GoogleDriveService: No refresh token received! This may cause issues.')
              }
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

  // Check if token is expired or about to expire (within 10 minutes for no-refresh-token scenario)
  isTokenExpired() {
    if (!this.accessToken) {
      logger.log('GoogleDriveService: No access token available')
      return true
    }
    
    if (!this.tokenExpiry) {
      logger.log('GoogleDriveService: No token expiry time available')
      return true
    }
    
    const now = new Date()
    // Use 10 minutes buffer for no-refresh-token scenario to allow more time for silent reauth
    const bufferTime = this.refreshToken ? (5 * 60 * 1000) : (10 * 60 * 1000)
    const bufferFromNow = new Date(Date.now() + bufferTime)
    const isExpired = this.tokenExpiry <= bufferFromNow
    
    if (isExpired) {
      logger.log('GoogleDriveService: Token is expired or expires soon', {
        now: now.toISOString(),
        expiry: this.tokenExpiry.toISOString(),
        minutesUntilExpiry: Math.round((this.tokenExpiry - now) / (1000 * 60)),
        hasRefreshToken: !!this.refreshToken,
        bufferMinutes: Math.round(bufferTime / (1000 * 60))
      })
    }
    
    return isExpired
  }

  // Try to refresh the token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      logger.error('GoogleDriveService: No refresh token available for refresh')
      // Try to get refresh token from localStorage
      const storedRefreshToken = storage.getRefreshToken()
      if (storedRefreshToken) {
        this.refreshToken = storedRefreshToken
        logger.log('GoogleDriveService: Retrieved refresh token from localStorage')
      } else {
        // No refresh token available - try silent re-authentication
        logger.log('GoogleDriveService: No refresh token - attempting silent re-authentication...')
        return await this.attemptSilentReauth()
      }
    }

    try {
      logger.log('GoogleDriveService: Attempting to refresh access token...')
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logger.error('GoogleDriveService: Token refresh failed with status:', response.status, errorData)
        
        if (response.status === 400 && errorData.error === 'invalid_grant') {
          // Refresh token is invalid or expired
          logger.error('GoogleDriveService: Refresh token is invalid or expired')
          this.clearTokens()
          throw new Error('Refresh token expired - user needs to re-authenticate')
        }
        
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.access_token) {
        throw new Error('No access token received in refresh response')
      }
      
      // Update tokens
      this.accessToken = data.access_token
      this.tokenExpiry = new Date(Date.now() + ((data.expires_in || 3600) * 1000))
      
      // If new refresh token is provided, update it
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token
      }
      
      // Save updated tokens to localStorage
      storage.setAuthToken(this.accessToken, this.refreshToken, this.tokenExpiry)
      
      logger.log('GoogleDriveService: Token refreshed successfully, expires at:', this.tokenExpiry)
      return true
      
    } catch (error) {
      logger.error('GoogleDriveService: Token refresh failed:', error)
      
      // If refresh fails, clear tokens to force re-authentication
      if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
        this.clearTokens()
      }
      
      return false
    }
  }

  // Clear all tokens
  clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiry = null
    this.needsFrequentReauth = false
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    
    storage.clearUserData()
    logger.log('GoogleDriveService: All tokens cleared')
  }

  // Generate PKCE code verifier and challenge
  generatePKCE() {
    // Generate code verifier (random string)
    const codeVerifier = this.generateRandomString(128)
    
    // Generate code challenge (SHA256 hash of verifier, base64url encoded)
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
      .then(hashBuffer => {
        const codeChallenge = this.base64URLEncode(hashBuffer)
        return { codeVerifier, codeChallenge }
      })
  }

  // Generate random string for PKCE
  generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let result = ''
    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length]
    }
    return result
  }

  // Base64URL encode
  base64URLEncode(buffer) {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  // Exchange authorization code for tokens using PKCE
  async exchangeCodeForTokens(authorizationCode, codeVerifier) {
    try {
      logger.log('GoogleDriveService: Exchanging authorization code for tokens with PKCE...')
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          code: authorizationCode,
          code_verifier: codeVerifier, // PKCE code verifier
          grant_type: 'authorization_code',
          redirect_uri: window.location.origin,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logger.error('GoogleDriveService: Token exchange failed:', response.status, errorData)
        throw new Error(`Token exchange failed: ${response.status} - ${errorData.error_description || errorData.error}`)
      }

      const tokenData = await response.json()
      
      logger.log('GoogleDriveService: Token exchange successful', {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      })

      if (!tokenData.refresh_token) {
        logger.error('GoogleDriveService: Still no refresh token received after code exchange!')
      }

      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in || 3600,
        token_type: tokenData.token_type || 'Bearer'
      }
      
    } catch (error) {
      logger.error('GoogleDriveService: Code exchange error:', error)
      throw error
    }
  }

  // Attempt silent re-authentication without refresh token
  async attemptSilentReauth() {
    try {
      logger.log('GoogleDriveService: Attempting silent re-authentication...')
      
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        throw new Error('Google OAuth library not loaded')
      }
      
      return new Promise((resolve) => {
        const silentTokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scope,
          callback: (response) => {
            if (response.access_token) {
              logger.log('GoogleDriveService: Silent re-authentication successful')
              this.accessToken = response.access_token
              this.tokenExpiry = new Date(Date.now() + (response.expires_in * 1000))
              
              // Save new token
              storage.setAuthToken(response.access_token, null, this.tokenExpiry)
              
              // Schedule next refresh if we're in no-refresh-token mode
              if (this.needsFrequentReauth) {
                this.scheduleTokenRefresh()
              }
              
              resolve(true)
            } else {
              logger.log('GoogleDriveService: Silent re-authentication failed')
              resolve(false)
            }
          },
        })
        
        // Try silent request first (no prompt)
        silentTokenClient.requestAccessToken({ prompt: '' })
      })
      
    } catch (error) {
      logger.error('GoogleDriveService: Silent re-authentication error:', error)
      return false
    }
  }

  // Schedule automatic token refresh for no-refresh-token scenario
  scheduleTokenRefresh() {
    // Clear any existing refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    if (!this.tokenExpiry) return
    
    // Schedule refresh 15 minutes before expiry
    const refreshTime = this.tokenExpiry.getTime() - Date.now() - (15 * 60 * 1000)
    
    if (refreshTime > 0) {
      logger.log('GoogleDriveService: Scheduling automatic token refresh in', Math.round(refreshTime / (1000 * 60)), 'minutes')
      
      this.refreshTimer = setTimeout(async () => {
        logger.log('GoogleDriveService: Automatic token refresh triggered')
        try {
          const success = await this.attemptSilentReauth()
          if (success) {
            logger.log('GoogleDriveService: Automatic token refresh successful')
            // Schedule next refresh
            this.scheduleTokenRefresh()
          } else {
            logger.warn('GoogleDriveService: Automatic token refresh failed - user will need to re-authenticate on next API call')
          }
        } catch (error) {
          logger.error('GoogleDriveService: Automatic token refresh error:', error)
        }
      }, refreshTime)
    }
  }

  // Force re-authentication to get refresh token
  async forceReAuthentication() {
    logger.log('GoogleDriveService: Forcing re-authentication to get refresh token...')
    
    // Clear existing tokens
    this.clearTokens()
    
    // Revoke existing permissions to force consent screen
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        // This will force the consent screen to appear again
        await this.authenticate()
        return true
      } catch (error) {
        logger.error('GoogleDriveService: Force re-authentication failed:', error)
        return false
      }
    }
    
    return false
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
          logger.log('Google auth callback: Success, processing tokens', {
            hasAccessToken: !!response.access_token,
            hasRefreshToken: !!response.refresh_token,
            expiresIn: response.expires_in
          })
          
          this.accessToken = response.access_token
          // Set token expiry (typically 1 hour from now)
          this.tokenExpiry = new Date(Date.now() + (response.expires_in * 1000))
          this.refreshToken = response.refresh_token
          
          // Handle no-refresh-token scenario
          if (!this.refreshToken) {
            logger.log('GoogleDriveService: No refresh token - using silent re-auth strategy')
            logger.log('GoogleDriveService: Token will be refreshed silently before expiry')
            
            // Set a flag to indicate we're in no-refresh-token mode
            this.needsFrequentReauth = true
            
            // Schedule automatic token refresh before expiry
            this.scheduleTokenRefresh()
          } else {
            logger.log('GoogleDriveService: Refresh token available - standard refresh strategy')
            this.needsFrequentReauth = false
          }
          
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
        
        // For client-side apps, use token client with silent refresh strategy
        logger.log('GoogleDriveService: Using token client with enhanced refresh strategy...')
        
        const tempTokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scope,
          callback: (response) => {
            if (isResolved) return
            
            logger.log('GoogleDriveService: Token client response:', {
              hasAccessToken: !!response.access_token,
              expiresIn: response.expires_in,
              error: response.error
            })
            
            // Even without refresh token, we can work with shorter-lived tokens
            if (response.access_token) {
              // Store a flag to indicate we need frequent re-auth
              response.needs_frequent_reauth = true
              authCallback(response)
            } else {
              authCallback({ error: response.error || 'no_access_token' })
            }
          },
        })
        
        // Request with consent to get maximum permissions
        tempTokenClient.requestAccessToken({ 
          prompt: 'consent'
        })
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
          throw new Error('Token refresh failed. Please sign in again to continue uploading.')
        }
      }

      // Double check we have a valid token
      if (!this.accessToken) {
        throw new Error('No access token available. Please sign in again.')
      }

      let blob, mimeType;
      
      // ALWAYS use original file to preserve quality - NO COMPRESSION
      if (originalFile) {
        logger.log('GoogleDrive: Using original file for upload (NO COMPRESSION), size:', originalFile.size, 'type:', originalFile.type);
        blob = originalFile;
        mimeType = originalFile.type;
      } else {
        // Fallback: base64'ten blob oluştur (compression yok)
        logger.log('GoogleDrive: Using base64 data for upload (NO COMPRESSION)');
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
          logger.log('GoogleDriveService: 401 Unauthorized error, attempting token refresh and retry...')
          
          try {
            const refreshSuccess = await this.refreshAccessToken()
            if (refreshSuccess && this.accessToken) {
              logger.log('GoogleDriveService: Token refreshed, retrying upload...')
              
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
                logger.log('GoogleDriveService: Upload successful after token refresh')
                return {
                  success: true,
                  fileId: result.id,
                  webViewLink: result.webViewLink,
                  message: 'Photo successfully uploaded to Google Drive!'
                }
              } else {
                const retryErrorText = await retryResponse.text()
                logger.error('GoogleDriveService: Retry upload failed:', retryResponse.status, retryErrorText)
                errorMessage = 'Upload failed after token refresh. Please try again or sign in again.'
              }
            } else {
              logger.error('GoogleDriveService: Token refresh failed during 401 retry')
              errorMessage = 'Authentication failed. Please sign in again to continue uploading.'
            }
          } catch (refreshError) {
            logger.error('GoogleDriveService: Error during token refresh:', refreshError)
            errorMessage = 'Authentication error. Please sign in again to continue uploading.'
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

  // Create a new folder in Google Drive with public sharing
  async createFolder(folderName) {
    try {
      // Check if token is expired and try to refresh
      if (this.isTokenExpired()) {
        logger.log('GoogleDriveService: Token expired, attempting refresh...')
        const refreshSuccess = await this.refreshAccessToken()
        if (!refreshSuccess) {
          throw new Error('Token refresh failed. Please sign in again to continue.')
        }
      }

      // Double check we have a valid token
      if (!this.accessToken) {
        throw new Error('No access token available. Please sign in again.')
      }

      logger.log('GoogleDriveService: Creating new folder:', folderName)

      // Step 1: Create the folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      }

      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(folderMetadata)
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        logger.error('Google Drive folder creation error:', {
          status: createResponse.status,
          statusText: createResponse.statusText,
          errorText: errorText
        })
        
        if (createResponse.status === 401) {
          // Try to refresh token and retry once
          logger.log('GoogleDriveService: 401 Unauthorized error during folder creation, attempting token refresh and retry...')
          
          try {
            const refreshSuccess = await this.refreshAccessToken()
            if (refreshSuccess && this.accessToken) {
              logger.log('GoogleDriveService: Token refreshed, retrying folder creation...')
              
              // Retry the folder creation with new token
              const retryResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(folderMetadata)
              })
              
              if (retryResponse.ok) {
                const folderResult = await retryResponse.json()
                logger.log('GoogleDriveService: Folder created successfully after token refresh')
                
                // Step 2: Set public sharing permissions
                const permissionResult = await this.setPublicSharing(folderResult.id)
                if (permissionResult.success) {
                  return {
                    success: true,
                    folderId: folderResult.id,
                    folderName: folderResult.name,
                    webViewLink: folderResult.webViewLink,
                    message: 'Folder created successfully with public sharing!'
                  }
                } else {
                  // Folder created but sharing failed
                  return {
                    success: true,
                    folderId: folderResult.id,
                    folderName: folderResult.name,
                    webViewLink: folderResult.webViewLink,
                    warning: 'Folder created but public sharing setup failed. You may need to set sharing manually.',
                    message: 'Folder created successfully!'
                  }
                }
              } else {
                const retryErrorText = await retryResponse.text()
                logger.error('GoogleDriveService: Retry folder creation failed:', retryResponse.status, retryErrorText)
                throw new Error('Folder creation failed after token refresh. Please try again or sign in again.')
              }
            } else {
              logger.error('GoogleDriveService: Token refresh failed during folder creation retry')
              throw new Error('Authentication failed. Please sign in again to continue.')
            }
          } catch (refreshError) {
            logger.error('GoogleDriveService: Error during token refresh for folder creation:', refreshError)
            throw new Error('Authentication error. Please sign in again to continue.')
          }
        } else {
          throw new Error(`Folder creation failed: ${createResponse.status} ${createResponse.statusText}`)
        }
      }

      const folderResult = await createResponse.json()
      logger.log('GoogleDriveService: Folder created successfully:', folderResult.id)

      // Step 2: Set public sharing permissions
      const permissionResult = await this.setPublicSharing(folderResult.id)
      if (permissionResult.success) {
        return {
          success: true,
          folderId: folderResult.id,
          folderName: folderResult.name,
          webViewLink: folderResult.webViewLink,
          message: 'Folder created successfully with public sharing!'
        }
      } else {
        // Folder created but sharing failed
        return {
          success: true,
          folderId: folderResult.id,
          folderName: folderResult.name,
          webViewLink: folderResult.webViewLink,
          warning: 'Folder created but public sharing setup failed. You may need to set sharing manually.',
          message: 'Folder created successfully!'
        }
      }

    } catch (error) {
      logger.error('Folder creation error:', error)
      return {
        success: false,
        error: error.message,
        message: 'An error occurred while creating the folder.'
      }
    }
  }

  // Set public sharing permissions for a folder
  async setPublicSharing(folderId) {
    try {
      const permissionMetadata = {
        role: 'writer',
        type: 'anyone'
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissionMetadata)
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('Google Drive permission setting error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        })
        
        return {
          success: false,
          error: `Failed to set public sharing: ${response.status} ${response.statusText}`
        }
      }

      logger.log('GoogleDriveService: Public sharing set successfully for folder:', folderId)
      return {
        success: true,
        message: 'Public sharing set successfully'
      }

    } catch (error) {
      logger.error('Permission setting error:', error)
      return {
        success: false,
        error: error.message
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