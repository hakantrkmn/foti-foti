import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCMrNvb2FZcCmwQL6p1kOTobpNJzQ7rT_M",
  authDomain: "foti-foti-d4f07.firebaseapp.com",
  projectId: "foti-foti-d4f07",
  storageBucket: "foti-foti-d4f07.firebasestorage.app",
  messagingSenderId: "381154649076",
  appId: "1:381154649076:web:4074d42de2150a96e40fa1",
  measurementId: "G-MEWD01RXF1"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Hash fonksiyonu (basit ama güvenli)
const generateHash = (data) => {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
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
      console.error('Firebase createFolder error:', error)
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
      console.error('Firebase getFolder error:', error)
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
      console.error('Firebase updateFolderLimit error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Kullanıcının yükleme sayısını artır
  static async incrementUserUploadCount(folderId, userId) {
    try {
      console.log('Firebase: incrementUserUploadCount called with:', { folderId, userId })
      
      const userUploadRef = doc(db, 'folders', folderId, 'uploads', userId)
      console.log('Firebase: User upload ref path:', userUploadRef.path)
      
      // Kullanıcının mevcut yükleme sayısını kontrol et
      const userDoc = await getDoc(userUploadRef)
      console.log('Firebase: User doc exists:', userDoc.exists())
      
      if (userDoc.exists()) {
        console.log('Firebase: Updating existing user record')
        // Mevcut kullanıcı, sayıyı artır
        await updateDoc(userUploadRef, {
          count: increment(1)
        })
        console.log('Firebase: User record updated successfully')
      } else {
        console.log('Firebase: Creating new user record')
        // Yeni kullanıcı, ilk yükleme
        await setDoc(userUploadRef, {
          userId,
          count: 1
        })
        console.log('Firebase: New user record created successfully')
      }
      
      return {
        success: true
      }
    } catch (error) {
      console.error('Firebase incrementUserUploadCount error:', error)
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
      console.error('Firebase checkUserUploadLimit error:', error)
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
        
        console.log('Firebase: User record created for:', userId)
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
      console.error('Firebase createUserRecord error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Hash doğrulama
  static async validateHash(folderId, hash) {
    try {
      const folderDoc = await getDoc(doc(db, 'folders', folderId))
      
      if (!folderDoc.exists()) {
        return {
          success: false,
          error: 'Klasör bulunamadı'
        }
      }
      
      const folderData = folderDoc.data()
      const expectedHash = generateHash({
        folderId: folderData.folderId,
        limit: folderData.limit,
        createdBy: folderData.createdBy
      })
      
      return {
        success: true,
        isValid: hash === expectedHash,
        folderData
      }
    } catch (error) {
      console.error('Firebase validateHash error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export { generateHash, decodeHash } 