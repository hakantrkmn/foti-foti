import { useNavigate } from 'react-router-dom'
import { FolderCreationScreen } from '../components/Auth'

export const CreatePage = () => {
  const navigate = useNavigate()

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <FolderCreationScreen onBack={handleBackToHome} />
  )
} 