// Google Drive API Service
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

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: this.discoveryDocs,
            })
            this.gapiInited = true
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      }
      script.onerror = reject
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
        
        console.log('Google auth callback: Processing response', response)
        isResolved = true
        
        if (response.error) {
          console.log('Google auth callback: Error received:', response.error)
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
          console.log('Google auth callback: Success, setting access token')
          this.accessToken = response.access_token
          
          // Get user info after successful authentication
          this.getUserInfo().then(userInfo => {
            this.userInfo = userInfo
            resolve({ accessToken: response.access_token, userInfo })
          }).catch(error => {
            console.error('Failed to get user info:', error)
            resolve({ accessToken: response.access_token, userInfo: null })
          })
        }
      }

      // Set timeout for this specific request
      const timeout = setTimeout(() => {
        if (!isResolved) {
          console.log('Google auth: Overall timeout after 60 seconds')
          isResolved = true
          reject(new Error('Giriş işlemi zaman aşımına uğradı'))
        }
      }, 60000)

      try {
        console.log('Google auth: Requesting access token...')
        
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
        console.error('User info response not ok:', response.status, response.statusText)
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
      console.error('Get user info error:', error)
      
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

  async uploadImage(imageData, fileName, folderId) {
    try {
      // Convert base64 to blob
      const base64Data = imageData.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })

      // Create form data
      const metadata = {
        name: fileName,
        parents: [folderId],
        mimeType: 'image/jpeg'
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
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        fileId: result.id,
        webViewLink: result.webViewLink,
        message: 'Fotoğraf başarıyla Google Drive\'a yüklendi!'
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message,
        message: 'Fotoğraf yüklenirken bir hata oluştu.'
      }
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
  }
}

export const googleDriveService = new GoogleDriveService() 