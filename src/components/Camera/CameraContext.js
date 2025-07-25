import { createContext } from 'react'

export const CameraContext = createContext({
  capturedImage: null,
  originalImageFile: null,
  isLoading: false,
  error: null,
  isGoogleDriveInitialized: false,
  uploadStatus: null,
  folderId: '',
  isAuthenticated: false,
  userInfo: null,
  uploadLimit: null,
  currentUploadCount: 0,
  uploadQueue: [],
  activeUploads: 0,
  uploadHistory: [],
  openNativeCamera: () => {},
  uploadToGoogleDrive: () => {},
  resetPhoto: () => {},
  handleAutoAuth: () => {},
  logout: () => {}
}) 