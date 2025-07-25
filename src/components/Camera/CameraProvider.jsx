import { useState, useEffect } from 'react'
import { CameraContext } from './CameraContext'
import { googleDriveService } from '../../services/googleDrive'
import { FirebaseService } from '../../services/firebase'
import { useNativeCamera } from '../../hooks/useNativeCamera'
import { useSearchParams } from 'react-router-dom'
import { useAnalytics } from '../../hooks/useAnalytics'
import { storage } from '../../utils/storage'

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
  
  // Asenkron upload sistemi için yeni state'ler
  const [uploadQueue, setUploadQueue] = useState([])
  const [activeUploads, setActiveUploads] = useState(0)
  const [uploadHistory, setUploadHistory] = useState([])
  
  const [searchParams] = useSearchParams()
  const { trackUserLogin, trackPhotoUpload, trackError } = useAnalytics()
  const { openCamera } = useNativeCamera()

  useEffect(() => {
    console.log('CameraProvider: useEffect triggered')
    
    // Check if user is already logged in from localStorage
    const savedUserInfo = storage.getUserInfo()
    const savedAuthToken = storage.getAuthToken()
    
    if (savedUserInfo && savedAuthToken) {
      console.log('CameraProvider: Found saved user info in localStorage')
      setUserInfo(savedUserInfo)
      setIsAuthenticated(true)
    }
    
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
        
        // If user is already authenticated, set token and load their data
        if (savedUserInfo && savedAuthToken) {
          console.log('CameraProvider: Setting saved auth token')
          googleDriveService.setAccessToken(savedAuthToken)
          
          if (urlFolderId) {
            console.log('CameraProvider: Loading saved user data for folder:', urlFolderId)
            await loadFirebaseData(urlFolderId, savedUserInfo.id)
          }
        }
      } catch (error) {
        console.error('CameraProvider: Google Drive initialization failed:', error)
        setError('Google Drive başlatılamadı: ' + error.message)
      }
    }
    
    initGoogleDrive()
  }, [initialFolderId])

  // Load folder info when folderId changes (but don't reset auth state)
  useEffect(() => {
    if (folderId) {
      console.log('CameraProvider: Folder ID changed, loading folder info')
      setError(null)
      setUploadStatus(null)
      
      // Load folder info from Firebase
      loadFolderInfoDirectly(folderId)
      
      // If user is already authenticated, load their data for this folder
      const savedUserInfo = storage.getUserInfo()
      if (savedUserInfo && isAuthenticated) {
        console.log('CameraProvider: Loading user data for new folder:', folderId)
        loadFirebaseData(folderId, savedUserInfo.id)
      }
    }
  }, [folderId, isAuthenticated])

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
               
               // Save folder info to localStorage
               storage.setFolderInfo(folderId, uploadLimit, limitResult.currentCount)
             } else {
               console.log('CameraProvider: Failed to get upload count, setting to 0')
               setCurrentUploadCount(0)
               
               // Save folder info to localStorage with 0 count
               storage.setFolderInfo(folderId, uploadLimit, 0)
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
          
          // Save user info and token to localStorage
          storage.setUserInfo(authResult.userInfo)
          if (authResult.accessToken) {
            storage.setAuthToken(authResult.accessToken)
          }
          
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

  const openNativeCamera = async () => {
    try {
      console.log('CameraProvider: Opening native camera...')
      setIsLoading(true)
      setError(null)
      
      const result = await openCamera()
      
      if (result.success) {
        console.log('CameraProvider: Native camera photo captured successfully')
        setCapturedImage(result.dataUrl)
        
        // Track successful photo capture
        trackPhotoUpload(folderId, true)
      } else {
        console.error('CameraProvider: Native camera failed:', result.error)
        setError(result.error || 'Kamera açılamadı')
      }
    } catch (error) {
      console.error('CameraProvider: Native camera error:', error)
      setError('Kamera açılırken bir hata oluştu: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }



  const uploadToGoogleDrive = () => {
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

    // Generate unique upload ID
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Generate filename with Google username and formatted date
    const now = new Date()
    const dateStr = now.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '-')
    
    const timeStr = now.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/:/g, '-')
    
    // Clean username for filename (remove special characters, limit length)
    const cleanUsername = userInfo.name
      .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '') // Remove special characters except Turkish letters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 30) // Limit length
      .trim()
    
    const fileName = `${cleanUsername}_${dateStr}_${timeStr}.jpg`
    
    // Create upload object
    const uploadItem = {
      id: uploadId,
      fileName,
      status: 'pending',
      progress: 0,
      error: null,
      startTime: now,
      endTime: null
    }
    
    // Add to upload queue
    setUploadQueue(prev => [...prev, uploadItem])
    setActiveUploads(prev => prev + 1)
    
    // Clear current image so user can take new photo
    setCapturedImage(null)
    setError(null)
    
    // Start async upload process
    processUpload(uploadId, capturedImage, fileName, folderId.trim())
  }

  const processUpload = async (uploadId, imageData, fileName, targetFolderId) => {
    try {
      console.log(`CameraProvider: Starting async upload ${uploadId}...`)
      
      // Update status to uploading
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId 
          ? { ...item, status: 'uploading', progress: 10 }
          : item
      ))
      
      // If not authenticated, authenticate first
      if (!isAuthenticated) {
        console.log(`CameraProvider: Authenticating for upload ${uploadId}...`)
        
        try {
          const authResult = await googleDriveService.authenticate()
          console.log(`CameraProvider: Authentication successful for upload ${uploadId}!`)
          setIsAuthenticated(true)
          
          if (authResult.userInfo) {
            setUserInfo(authResult.userInfo)
          }
        } catch (authError) {
          console.error(`CameraProvider: Auth failed for upload ${uploadId}:`, authError)
          
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
          
          // Update upload status to error
          setUploadQueue(prev => prev.map(item => 
            item.id === uploadId 
              ? { ...item, status: 'error', error: authErrorMessage, endTime: new Date() }
              : item
          ))
          setActiveUploads(prev => prev - 1)
          trackError('upload_error', authErrorMessage)
          return
        }
      }

      // Check upload limit before uploading (if we have limit info)
      if (uploadLimit !== null && uploadLimit !== -1) {
        console.log(`CameraProvider: Checking upload limit for ${uploadId}...`)
        const limitResult = await FirebaseService.checkUserUploadLimit(targetFolderId, userInfo.id)
        
        if (limitResult.success) {
          if (!limitResult.canUpload) {
            const errorMessage = `Yükleme limitiniz doldu! (${limitResult.currentCount}/${limitResult.limit})`
            
            setUploadQueue(prev => prev.map(item => 
              item.id === uploadId 
                ? { ...item, status: 'error', error: errorMessage, endTime: new Date() }
                : item
            ))
            setActiveUploads(prev => prev - 1)
            trackPhotoUpload(targetFolderId, false)
            return
          }
          
          console.log(`CameraProvider: Upload limit OK for ${uploadId} (${limitResult.currentCount}/${limitResult.limit})`)
        } else {
          console.error(`CameraProvider: Upload limit check failed for ${uploadId}:`, limitResult.error)
          const errorMessage = 'Limit kontrolü yapılamadı. Lütfen tekrar deneyin.'
          
          setUploadQueue(prev => prev.map(item => 
            item.id === uploadId 
              ? { ...item, status: 'error', error: errorMessage, endTime: new Date() }
              : item
          ))
          setActiveUploads(prev => prev - 1)
          trackError('upload_error', errorMessage)
          return
        }
      } else {
        console.log(`CameraProvider: No upload limit set for ${uploadId}, proceeding without limit check`)
      }
      
      // Update progress
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId 
          ? { ...item, progress: 50 }
          : item
      ))
      
      // Upload image with custom folder ID
      const result = await googleDriveService.uploadImage(imageData, fileName, targetFolderId)
      
      if (result.success) {
        console.log(`CameraProvider: Google Drive upload successful for ${uploadId}, updating Firebase...`)
        
        // Track successful photo upload
        trackPhotoUpload(targetFolderId, true)
        
        // Increment upload count in Firebase (always, regardless of limit)
        console.log(`CameraProvider: Calling FirebaseService.incrementUserUploadCount for ${uploadId}...`)
        const firebaseResult = await FirebaseService.incrementUserUploadCount(targetFolderId, userInfo.id)
        console.log(`CameraProvider: Firebase increment result for ${uploadId}:`, firebaseResult)
        
        if (firebaseResult.success) {
          setCurrentUploadCount(prev => prev + 1)
          console.log(`CameraProvider: Upload count incremented successfully for ${uploadId}`)
        } else {
          console.error(`CameraProvider: Firebase increment failed for ${uploadId}:`, firebaseResult.error)
        }
        
        // Update upload status to success
        setUploadQueue(prev => prev.map(item => 
          item.id === uploadId 
            ? { 
                ...item, 
                status: 'success', 
                progress: 100, 
                endTime: new Date(),
                fileId: result.fileId,
                webViewLink: result.webViewLink
              }
            : item
        ))
        
            // Move to history after 5 seconds
    setTimeout(() => {
      setUploadQueue(prev => prev.filter(item => item.id !== uploadId))
      setUploadHistory(prev => [...prev, {
        id: uploadId,
        fileName,
        status: 'success',
        startTime: new Date(),
        endTime: new Date(),
        fileId: result.fileId,
        webViewLink: result.webViewLink
      }])
    }, 5000)
        
      } else {
        console.error(`CameraProvider: Upload failed for ${uploadId}:`, result.message)
        
        setUploadQueue(prev => prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'error', error: result.message, endTime: new Date() }
            : item
        ))
        
        // Track failed photo upload
        trackPhotoUpload(targetFolderId, false)
      }
      
    } catch (error) {
      console.error(`CameraProvider: Upload error for ${uploadId}:`, error)
      
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId 
          ? { 
              ...item, 
              status: 'error', 
              error: 'Google Drive\'a yükleme sırasında bir hata oluştu: ' + error.message, 
              endTime: new Date() 
            }
          : item
      ))
      
      // Track upload error
      trackError('upload_error', error.message)
    } finally {
      setActiveUploads(prev => prev - 1)
    }
  }

           const resetPhoto = () => {
           setCapturedImage(null)
           setError(null)
           setUploadStatus(null)
         }

         const logout = () => {
           console.log('CameraProvider: Logging out user')
           
           // Clear user data from localStorage
           storage.clearUserData()
           
           // Clear Google Drive auth
           if (window.gapi && window.gapi.auth2) {
             const auth2 = window.gapi.auth2.getAuthInstance()
             if (auth2) {
               auth2.signOut()
             }
           }
           
           // Reset state
           setIsAuthenticated(false)
           setUserInfo(null)
           setError(null)
           setUploadStatus(null)
           
           console.log('CameraProvider: User logged out successfully')
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
           uploadQueue,
           activeUploads,
           uploadHistory,
           uploadLimit,
           currentUploadCount,
           openNativeCamera,
           uploadToGoogleDrive,
           resetPhoto,
           handleAutoAuth,
           logout
         }

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  )
} 