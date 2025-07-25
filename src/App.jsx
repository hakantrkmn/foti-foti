import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './components/Auth'
import { UploadPage } from './pages/UploadPage'
import { CreatePage } from './pages/CreatePage'
import { CameraProvider } from './components/Camera'
import { PWAInstallPrompt } from './components/Camera/PWAInstallPrompt'
import { DarkModeProvider } from './contexts/DarkModeProvider'

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <CameraProvider>
          <Routes>
            {/* Ana sayfa - Login */}
            <Route path="/" element={<LoginScreen />} />
            
            {/* Photo upload page */}
            <Route path="/upload" element={<UploadPage />} />
            
            {/* Klasör oluşturma sayfası */}
            <Route path="/create" element={<CreatePage />} />
            
            {/* Bilinmeyen rotalar için ana sayfaya yönlendir */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </CameraProvider>
      </Router>
    </DarkModeProvider>
  )
}

export default App
