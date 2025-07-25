import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { logger } from '../utils/logger.js'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Hash fonksiyonu (basit ama güvenli)
const generateHash = (data) => {
  // Platform bağımsız hash oluşturma
  const str = JSON.stringify(data, Object.keys(data).sort())
  let hash = 0
  const len = str.length
  
  for (let i = 0; i < len; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Platform bağımsız sonuç için Math.abs kullan
  return Math.abs(hash).toString(36)
}

// Hash'i decode etme
const decodeHash = (hash) => {
  // Bu basit hash geri çevrilemez, bu yüzden hash'i URL'de saklayacağız
  // ve orijinal veriyi Firebase'de tutacağız
  return hash
}

export class FirebaseService {
  // Klasör oluşturma
  static async createFolder(folderId, limit, createdBy) {
    try {
      const folderData = {
        folderId,
        limit: parseInt(limit),
        createdBy,
        createdAt: new Date().toISOString(),
        isActive: true
      }

      await setDoc(doc(db, 'folders', folderId), folderData)
      
      // Hash oluştur
      const hashData = { folderId, limit, createdBy }
      const hash = generateHash(hashData)
      
      return {
        success: true,
        hash,
        folderData
      }
    } catch (error) {
      logger.error('Firebase createFolder error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Klasör bilgilerini getir
  static async getFolder(folderId) {
    try {
      const docRef = doc(db, 'folders', folderId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: docSnap.data()
        }
      } else {
        return {
          success: false,
          error: 'Klasör bulunamadı'
        }
      }
    } catch (error) {
      logger.error('Firebase getFolder error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Klasör limitini güncelle
  static async updateFolderLimit(folderId, newLimit) {
    try {
      const docRef = doc(db, 'folders', folderId)
      await updateDoc(docRef, {
        limit: parseInt(newLimit),
        updatedAt: new Date().toISOString()
      })
      
      return {
        success: true
      }
    } catch (error) {
      logger.error('Firebase updateFolderLimit error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Kullanıcının yükleme sayısını artır
  static async incrementUserUploadCount(folderId, userId) {
    try {
      logger.log('Firebase: incrementUserUploadCount called with:', { folderId, userId })
      
      const userUploadRef = doc(db, 'folders', folderId, 'uploads', userId)
      logger.log('Firebase: User upload ref path:', userUploadRef.path)
      
      // Kullanıcının mevcut yükleme sayısını kontrol et
      const userDoc = await getDoc(userUploadRef)
      logger.log('Firebase: User doc exists:', userDoc.exists())
      
      if (userDoc.exists()) {
        logger.log('Firebase: Updating existing user record')
        // Mevcut kullanıcı, sayıyı artır
        await updateDoc(userUploadRef, {
          count: increment(1)
        })
        logger.log('Firebase: User record updated successfully')
      } else {
        logger.log('Firebase: Creating new user record')
        // Yeni kullanıcı, ilk yükleme
        await setDoc(userUploadRef, {
          userId,
          count: 1
        })
        logger.log('Firebase: New user record created successfully')
      }
      
      return {
        success: true
      }
    } catch (error) {
      logger.error('Firebase incrementUserUploadCount error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Kullanıcının yükleme sayısını kontrol et
  static async checkUserUploadLimit(folderId, userId) {
    try {
      const userUploadRef = doc(db, 'folders', folderId, 'uploads', userId)
      const userDoc = await getDoc(userUploadRef)
      
      const folderDoc = await getDoc(doc(db, 'folders', folderId))
      
      if (!folderDoc.exists()) {
        return {
          success: false,
          error: 'Klasör bulunamadı'
        }
      }
      
      const folderData = folderDoc.data()
      const userCount = userDoc.exists() ? userDoc.data().count : 0
      
      return {
        success: true,
        canUpload: userCount < folderData.limit,
        currentCount: userCount,
        limit: folderData.limit,
        remaining: folderData.limit - userCount
      }
    } catch (error) {
      logger.error('Firebase checkUserUploadLimit error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Kullanıcı kaydını oluştur (eğer yoksa)
  static async createUserRecord(folderId, userId) {
    try {
      const userUploadRef = doc(db, 'folders', folderId, 'uploads', userId)
      const userDoc = await getDoc(userUploadRef)
      
      if (!userDoc.exists()) {
        // Kullanıcı kaydı yoksa oluştur
        await setDoc(userUploadRef, {
          userId,
          count: 0
        })
        
        logger.log('Firebase: User record created for:', userId)
        return {
          success: true,
          created: true
        }
      }
      
      return {
        success: true,
        created: false
      }
    } catch (error) {
      logger.error('Firebase createUserRecord error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Hash doğrulama
  static async validateHash(folderId, hash) {
    try {
      logger.log('Firebase: Validating hash for folderId:', folderId, 'hash:', hash)
      
      const folderDoc = await getDoc(doc(db, 'folders', folderId))
      
      if (!folderDoc.exists()) {
        logger.log('Firebase: Folder not found')
        return {
          success: false,
          error: 'Klasör bulunamadı'
        }
      }
      
      const folderData = folderDoc.data()
      logger.log('Firebase: Folder data:', folderData)
      
      // Hash oluşturma için aynı veri yapısını kullan
      const hashData = {
        folderId: folderData.folderId,
        limit: folderData.limit,
        createdBy: folderData.createdBy
      }
      
      const expectedHash = generateHash(hashData)
      logger.log('Firebase: Expected hash:', expectedHash, 'Received hash:', hash)
      
      const isValid = hash === expectedHash
      logger.log('Firebase: Hash validation result:', isValid)
      
      return {
        success: true,
        isValid,
        folderData
      }
    } catch (error) {
      logger.error('Firebase validateHash error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export { generateHash, decodeHash } 