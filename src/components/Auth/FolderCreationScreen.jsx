import { useState } from 'react'
import QRCode from 'qrcode'
import { FirebaseService, generateHash } from '../../services/firebase'
import { useAnalytics } from '../../hooks/useAnalytics'
import { getUploadUrl } from '../../utils/config'
import { DarkModeToggle } from '../DarkModeToggle'
import { logger } from '../../utils/logger.js'

export const FolderCreationScreen = ({ onBack }) => {
  const [folderId, setFolderId] = useState('')
  const [limit, setLimit] = useState(10)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { trackFolderCreation } = useAnalytics()

  const generateQRCode = async () => {
    if (!folderId.trim()) {
      setError('Lütfen Google Drive klasör ID\'sini girin.')
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess('')

    try {
      // Firebase'de klasör oluştur
      const result = await FirebaseService.createFolder(
        folderId.trim(),
        limit,
        'anonymous' // Klasör oluşturan kişi bilgisi
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      // Track folder creation
      trackFolderCreation(folderId.trim(), limit)

      // QR kod için URL oluştur (hash ile)
      const qrData = getUploadUrl(folderId.trim(), result.hash)
      
      // QR kod oluştur
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeUrl(qrCodeDataUrl)
      setSuccess('QR kod başarıyla oluşturuldu!')
    } catch (error) {
      logger.error('QR kod oluşturma hatası:', error)
      setError('QR kod oluşturulurken bir hata oluştu: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return

    try {
      const qrData = getUploadUrl(folderId.trim(), generateHash({ folderId: folderId.trim(), limit }))
      
      await navigator.clipboard.writeText(qrData)
      alert('URL panoya kopyalandı!')
    } catch (error) {
      logger.error('Kopyalama hatası:', error)
      alert('URL kopyalanamadı.')
    }
  }

  const updateFolderLimit = async () => {
    if (!folderId.trim()) {
      setError('Lütfen Google Drive klasör ID\'sini girin.')
      return
    }

    try {
      const result = await FirebaseService.updateFolderLimit(folderId.trim(), limit)
      
      if (result.success) {
        setSuccess('Klasör limiti güncellendi!')
        // QR kodu yeniden oluştur
        generateQRCode()
      } else {
        setError('Limit güncellenirken hata oluştu: ' + result.error)
      }
    } catch (error) {
      logger.error('Limit güncelleme hatası:', error)
      setError('Limit güncellenirken bir hata oluştu.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white text-center flex-1">
              Create Folder
            </h2>
            <div className="flex items-center space-x-2">
              <DarkModeToggle />
            </div>
          </div>

          {/* Folder ID Input */}
          <div className="mb-6">
            <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Google Drive Folder ID
            </label>
            <input
              id="folderId"
              type="text"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              placeholder="Enter Google Drive folder ID"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400"
            />
            
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">
                <strong>How to get Folder ID:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a folder in Google Drive</li>
                <li>Right-click on folder → "Share" → "Anyone with the link" → "Viewer"</li>
                <li>Copy ID from folder URL: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">https://drive.google.com/drive/folders/FOLDER_ID_HERE</code></li>
                <li>Paste the <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">FOLDER_ID_HERE</code> part in the box above</li>
              </ol>
            </div>
          </div>

          {/* Limit Selection */}
          <div className="mb-6">
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Limit
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5 photos</option>
              <option value={10}>10 photos</option>
              <option value={20}>20 photos</option>
              <option value={50}>50 photos</option>
              <option value={100}>100 photos</option>
              <option value={-1}>Unlimited</option>
            </select>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Each user can upload maximum {limit === -1 ? 'unlimited' : limit} photos to this folder.</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 rounded-lg">
              {success}
            </div>
          )}

          {/* Generate QR Button */}
          <div className="mb-6">
            <button
              onClick={generateQRCode}
              disabled={isGenerating || !folderId.trim()}
              className="
                w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600
                rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                focus:outline-none focus:ring-4 focus:ring-green-300
              "
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating QR Code...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  Generate QR Code
                </>
              )}
            </button>
          </div>

          {/* Update Limit Button (if QR already exists) */}
          {qrCodeUrl && (
            <div className="mb-6">
              <button
                onClick={updateFolderLimit}
                className="
                  w-full flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600
                  rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-blue-300
                "
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update Limit
              </button>
            </div>
          )}

          {/* QR Code Display */}
          {qrCodeUrl && (
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                QR Code Generated!
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto mb-4 max-w-full h-auto"
                />
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Scan this QR code to access the app.
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Limit: {limit === -1 ? 'Unlimited' : `${limit} photos`}
                  </p>
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className="
                    inline-flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded-lg
                    hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300
                  "
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy URL
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>QR code automatically logs into the app with folder ID and limit.</p>
                <p>Security is provided with hash parameter.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 