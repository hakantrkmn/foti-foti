import { useState, useRef, useEffect } from 'react'
import { CameraContext } from './CameraContext'
import { googleDriveService } from '../../services/googleDrive'
import { FirebaseService } from '../../services/firebase'
import { useSearchParams } from 'react-router-dom'
import { useAnalytics } from '../../hooks/useAnalytics'

export const CameraProvider = ({ children, initialFolderId = null }) => {
  const [capturedImage, setCapturedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isGoogleDriveInitialized, setIsGoogleDriveInitialized] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [folderId, setFolderId] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [uploadLimit, setUploadLimit] = useState(null)
  const [currentUploadCount, setCurrentUploadCount] = useState(0)
  
  const fileInputRef = useRef(null)
  const [searchParams] = useSearchParams()
  const { trackUserLogin, trackPhotoUpload, trackError } = useAnalytics()

  useEffect(() => {
    console.log('CameraProvider: useEffect triggered')
    
    // Check URL parameters for folderId (required)
    const urlFolderId = searchParams.get('folderId')
    console.log('CameraProvider: URL folderId:', urlFolderId)
    
    if (urlFolderId) {
      console.log('CameraProvider: Found folder ID in URL params:', urlFolderId)
      setFolderId(urlFolderId)
      
      // Check for hash parameter
      const hash = searchParams.get('hash')
      if (hash) {
        console.log('CameraProvider: Found hash in URL params')
        validateHashAndLoadLimit(urlFolderId, hash)
      } else {
        console.log('CameraProvider: No hash found, trying to load folder info directly')
        loadFolderInfoDirectly(urlFolderId)
      }
    } else {
      console.log('CameraProvider: No folderId in URL params')
      setError('Klasör ID bulunamadı. Lütfen QR kodu tekrar tarayın.')
    }

    // Initialize Google Drive service
    const initGoogleDrive = async () => {
      try {
        console.log('CameraProvider: Initializing Google Drive service...')
        const initialized = await googleDriveService.initialize()
        console.log('CameraProvider: Google Drive initialized:', initialized)
        setIsGoogleDriveInitialized(initialized)
        
        // Otomatik authentication kaldırıldı - timeout sorunu nedeniyle
        // Kullanıcı manuel olarak "Giriş Yap" butonuna tıklayarak giriş yapmalı
      } catch (error) {
        console.error('CameraProvider: Google Drive initialization failed:', error)
        setError('Google Drive başlatılamadı: ' + error.message)
      }
    }
    
    initGoogleDrive()
  }, [initialFolderId])

  // Reset auth state and load folder info when folderId changes
  useEffect(() => {
    if (folderId) {
      console.log('CameraProvider: Folder ID changed, resetting auth state and loading folder info')
      setIsAuthenticated(false)
      setError(null)
      setUploadStatus(null)
      
      // Clear any existing tokens to force re-authentication
      if (window.gapi && window.gapi.auth2) {
        const auth2 = window.gapi.auth2.getAuthInstance()
        if (auth2) {
          auth2.signOut()
        }
      }
      
      // Load folder info from Firebase
      loadFolderInfoDirectly(folderId)
    }
  }, [folderId])

  const validateHashAndLoadLimit = async (folderId, hash) => {
    try {
      console.log('CameraProvider: Validating hash and loading limit...')
      const result = await FirebaseService.validateHash(folderId, hash)
      
      if (result.success && result.isValid) {
        console.log('CameraProvider: Hash validated, loading limit info')
        setUploadLimit(result.folderData.limit)
        
        // Check current user upload count if authenticated
        if (userInfo) {
          await checkUserUploadLimit(folderId, userInfo.id)
        }
      } else {
        console.log('CameraProvider: Hash validation failed')
        setError('QR kod geçersiz veya süresi dolmuş.')
        setIsAuthenticated(false) // Kullanıcının giriş yapmasını engelle
      }
    } catch (error) {
      console.error('CameraProvider: Hash validation error:', error)
      setError('Limit bilgileri yüklenirken hata oluştu.')
      setIsAuthenticated(false) // Kullanıcının giriş yapmasını engelle
    }
  }

  const loadFirebaseData = async (folderId, userId) => {
    try {
      console.log('CameraProvider: Loading Firebase data for user:', userId)
      
      // Create user record if it doesn't exist
      const createResult = await FirebaseService.createUserRecord(folderId, userId)
      
      if (createResult.success) {
        // Check current upload count
        const limitResult = await FirebaseService.checkUserUploadLimit(folderId, userId)
        
        if (limitResult.success) {
          setCurrentUploadCount(limitResult.currentCount)
          console.log('CameraProvider: User upload count loaded:', limitResult.currentCount)
        } else {
          console.log('CameraProvider: Failed to get upload count, setting to 0')
          setCurrentUploadCount(0)
        }
      } else {
        console.log('CameraProvider: Failed to create user record, setting count to 0')
        setCurrentUploadCount(0)
      }
    } catch (error) {
      console.error('CameraProvider: Load Firebase data error:', error)
      setCurrentUploadCount(0)
    }
  }

  const loadFolderInfoDirectly = async (folderId) => {
    try {
      console.log('CameraProvider: Loading folder info directly from Firebase for folderId:', folderId)
      const result = await FirebaseService.getFolder(folderId)
      
      if (result.success) {
        console.log('CameraProvider: Folder info loaded successfully:', result.data)
        setUploadLimit(result.data.limit)
        console.log('CameraProvider: Upload limit set to:', result.data.limit)
        
        // If user is authenticated, load their upload count
        if (userInfo) {
          console.log('CameraProvider: User is authenticated, loading user data...')
          await loadFirebaseData(folderId, userInfo.id)
        } else {
          console.log('CameraProvider: User not authenticated yet, will load user data after auth')
        }
      } else {
        console.log('CameraProvider: Folder not found in Firebase, error:', result.error)
        setError('Bu klasör bulunamadı. Lütfen QR kodu tekrar tarayın veya klasör sahibiyle iletişime geçin.')
        setUploadLimit(null)
        setIsAuthenticated(false) // Kullanıcının giriş yapmasını engelle
      }
    } catch (error) {
      console.error('CameraProvider: Load folder info error:', error)
      setError('Klasör bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.')
      setUploadLimit(null)
      setIsAuthenticated(false) // Kullanıcının giriş yapmasını engelle
    }
  }

  const checkUserUploadLimit = async (folderId, userId) => {
    try {
      console.log('CameraProvider: Checking user upload limit...')
      const result = await FirebaseService.checkUserUploadLimit(folderId, userId)
      
      if (result.success) {
        setCurrentUploadCount(result.currentCount)
        
        if (!result.canUpload) {
          setError(`Yükleme limitiniz doldu! (${result.currentCount}/${result.limit})`)
        }
      } else {
        console.error('CameraProvider: Upload limit check failed:', result.error)
      }
    } catch (error) {
      console.error('CameraProvider: Upload limit check error:', error)
    }
  }

  const handleAutoAuth = async () => {
    try {
      console.log('CameraProvider: Starting auto auth...')
      
      // Check if Google Drive is initialized
      if (!isGoogleDriveInitialized) {
        console.log('CameraProvider: Google Drive not initialized, initializing first...')
        setUploadStatus('Google Drive başlatılıyor...')
        
        const initialized = await googleDriveService.initialize()
        console.log('CameraProvider: Google Drive initialization result:', initialized)
        setIsGoogleDriveInitialized(initialized)
        
        if (!initialized) {
          throw new Error('Google Drive başlatılamadı')
        }
      }
      
      setIsLoading(true)
      setError(null)
      setUploadStatus('Google Drive\'a giriş yapılıyor...')
      
      // Try to authenticate silently
      console.log('CameraProvider: Calling googleDriveService.authenticate()...')
      const authResult = await googleDriveService.authenticate()
      console.log('CameraProvider: Authentication successful!')
      setIsAuthenticated(true)
      
              // Set user info
        if (authResult.userInfo) {
          setUserInfo(authResult.userInfo)
          console.log('CameraProvider: User info set:', authResult.userInfo)
          
          // Track successful login
          trackUserLogin('google')
          
          // Load Firebase data if we have folder info
          if (folderId) {
            console.log('CameraProvider: Loading Firebase data after authentication for folderId:', folderId)
            await loadFirebaseData(folderId, authResult.userInfo.id)
          } else {
            console.log('CameraProvider: No folderId available after authentication')
          }
        }
      
      // Clear any previous errors
      setError(null)
      
      // Show success message
      setUploadStatus({
        type: 'success',
        message: 'Otomatik giriş başarılı! Artık fotoğraf yükleyebilirsiniz.'
      })
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(null)
      }, 3000)
      
    } catch (error) {
      console.error('CameraProvider: Auto auth failed:', error)
      
      // Only show error if authentication was not successful
      if (!isAuthenticated) {
        // Handle specific error types
        let errorMessage = 'Otomatik giriş başarısız: '
        
        if (error.message.includes('iptal edildi')) {
          errorMessage = 'Giriş işlemi iptal edildi. Lütfen "Giriş Yap" butonuna tıklayarak tekrar deneyin.'
        } else if (error.message.includes('zaman aşımı')) {
          errorMessage = 'Giriş işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.'
        } else if (error.message.includes('izni reddedildi')) {
          errorMessage = 'Google Drive erişim izni reddedildi. Lütfen izinleri kontrol edin.'
        } else if (error.message.includes('başlatılamadı')) {
          errorMessage = 'Google Drive başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.'
        } else if (error.message.includes('not initialized')) {
          errorMessage = 'Google Drive henüz hazır değil. Lütfen sayfayı yenileyip tekrar deneyin.'
        } else {
          errorMessage += error.message
        }
        
        setError(errorMessage)
        setUploadStatus(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // updateFolderId function removed - folder ID is now read-only from URL

  const openNativeCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setIsLoading(true)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target.result)
        setIsLoading(false)
        setError(null)
        setUploadStatus(null)
      }
      reader.onerror = () => {
        setError('Fotoğraf yüklenirken bir hata oluştu.')
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    }
    
    // Input'u temizle ki aynı dosya tekrar seçilebilsin
    event.target.value = ''
  }

  const uploadToGoogleDrive = async () => {
    if (!capturedImage) {
      setError('Yüklenecek fotoğraf bulunamadı.')
      return
    }

    if (!isGoogleDriveInitialized) {
      setError('Google Drive henüz hazır değil. Lütfen sayfayı yenileyin.')
      return
    }

    if (!folderId.trim()) {
      setError('Klasör ID bulunamadı. Lütfen QR kodu tekrar tarayın.')
      return
    }

    // Validate folder ID format (Google Drive folder IDs are typically 33 characters)
    if (folderId.trim().length < 20) {
      setError('Geçersiz klasör ID formatı. Lütfen doğru klasör ID\'sini girin.')
      return
    }

    if (!userInfo) {
      setError('Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.')
      return
    }

    try {
      console.log('CameraProvider: Starting upload to Google Drive...')
      setIsLoading(true)
      setError(null)
      
      // If not authenticated, authenticate first
      if (!isAuthenticated) {
        console.log('CameraProvider: Not authenticated, authenticating first...')
        setUploadStatus('Kimlik doğrulama yapılıyor...')
        
        try {
          const authResult = await googleDriveService.authenticate()
          console.log('CameraProvider: Authentication successful during upload!')
          setIsAuthenticated(true)
          
          if (authResult.userInfo) {
            setUserInfo(authResult.userInfo)
          }
        } catch (authError) {
          console.error('CameraProvider: Auth failed during upload:', authError)
          
          // Handle specific auth error types
          let authErrorMessage = 'Kimlik doğrulama başarısız: '
          
          if (authError.message.includes('iptal edildi')) {
            authErrorMessage = 'Giriş işlemi iptal edildi. Lütfen "Giriş Yap" butonuna tıklayarak tekrar deneyin.'
          } else if (authError.message.includes('zaman aşımı')) {
            authErrorMessage = 'Giriş işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.'
          } else if (authError.message.includes('izni reddedildi')) {
            authErrorMessage = 'Google Drive erişim izni reddedildi. Lütfen izinleri kontrol edin.'
          } else if (authError.message.includes('başlatılamadı')) {
            authErrorMessage = 'Giriş işlemi başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.'
          } else {
            authErrorMessage += authError.message
          }
          
          setError(authErrorMessage)
          setUploadStatus(null)
          return // Stop upload process
        }
      }

      // Check upload limit before uploading (if we have limit info)
      if (uploadLimit !== null && uploadLimit !== -1) {
        console.log('CameraProvider: Checking upload limit...')
        const limitResult = await FirebaseService.checkUserUploadLimit(folderId.trim(), userInfo.id)
        
        if (limitResult.success) {
          if (!limitResult.canUpload) {
            setError(`Yükleme limitiniz doldu! (${limitResult.currentCount}/${limitResult.limit})`)
            setUploadStatus(null)
            return
          }
          
          console.log(`CameraProvider: Upload limit OK (${limitResult.currentCount}/${limitResult.limit})`)
        } else {
          console.error('CameraProvider: Upload limit check failed:', limitResult.error)
          setError('Limit kontrolü yapılamadı. Lütfen tekrar deneyin.')
          setUploadStatus(null)
          return
        }
      } else {
        console.log('CameraProvider: No upload limit set, proceeding without limit check')
      }
      
      setUploadStatus('Google Drive\'a yükleniyor...')
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `foti-foti-${timestamp}.jpg`
      
      // Upload image with custom folder ID
      const result = await googleDriveService.uploadImage(capturedImage, fileName, folderId.trim())
      
                   if (result.success) {
               console.log('CameraProvider: Google Drive upload successful, updating Firebase...')
               console.log('CameraProvider: uploadLimit:', uploadLimit)
               console.log('CameraProvider: userInfo.id:', userInfo.id)
               
               // Track successful photo upload
               trackPhotoUpload(folderId.trim(), true)
               
               // Increment upload count in Firebase (always, regardless of limit)
               console.log('CameraProvider: Calling FirebaseService.incrementUserUploadCount...')
               const firebaseResult = await FirebaseService.incrementUserUploadCount(folderId.trim(), userInfo.id)
               console.log('CameraProvider: Firebase increment result:', firebaseResult)
               
               if (firebaseResult.success) {
                 setCurrentUploadCount(prev => prev + 1)
                 console.log('CameraProvider: Upload count incremented successfully')
               } else {
                 console.error('CameraProvider: Firebase increment failed:', firebaseResult.error)
               }
               
               setUploadStatus({
                 type: 'success',
                 message: result.message,
                 fileId: result.fileId,
                 webViewLink: result.webViewLink
               })
             } else {
               setError(result.message)
               setUploadStatus(null)
               // Track failed photo upload
               trackPhotoUpload(folderId.trim(), false)
             }
               } catch (error) {
             console.error('CameraProvider: Upload error:', error)
             setError('Google Drive\'a yükleme sırasında bir hata oluştu: ' + error.message)
             setUploadStatus(null)
             // Track upload error
             trackError('upload_error', error.message)
           } finally {
      setIsLoading(false)
    }
  }

  const resetPhoto = () => {
    setCapturedImage(null)
    setError(null)
    setUploadStatus(null)
  }

  const value = {
    capturedImage,
    isLoading,
    error,
    isGoogleDriveInitialized,
    uploadStatus,
    folderId,
    isAuthenticated,
    userInfo,
    uploadLimit,
    currentUploadCount,
    openNativeCamera,
    uploadToGoogleDrive,
    resetPhoto,
    handleAutoAuth
  }

  return (
    <CameraContext.Provider value={value}>
      {children}
      {/* Gizli file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </CameraContext.Provider>
  )
} 