import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './components/Auth'
import { UploadPage } from './pages/UploadPage'
import { CreatePage } from './pages/CreatePage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Ana sayfa - Login */}
        <Route path="/" element={<LoginScreen />} />
        
        {/* Fotoğraf yükleme sayfası */}
        <Route path="/upload" element={<UploadPage />} />
        
        {/* Klasör oluşturma sayfası */}
        <Route path="/create" element={<CreatePage />} />
        
        {/* Bilinmeyen rotalar için ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
