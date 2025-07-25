import { 
  CameraProvider, 
  CameraButton, 
  ImagePreview, 
  CameraPlaceholder,
  useCamera 
} from './components/Camera'

function App() {
  return (
    <CameraProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Fotoğraf Çekme Uygulaması
            </h1>
            <p className="text-gray-600">
              Telefonunuzun kamerası ile fotoğraf çekin
            </p>
          </header>

          <main className="bg-white rounded-2xl shadow-xl p-8">
            <CameraContent />
          </main>
        </div>
      </div>
    </CameraProvider>
  )
}

function CameraContent() {
  const { capturedImage } = useCamera()

  if (capturedImage) {
    return <ImagePreview />
  }

  return <CameraPlaceholder />
}

export default App
