// Configuration utilities
export const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin
  console.log('Config: Base URL:', baseUrl)
  console.log('Config: Environment:', import.meta.env.MODE)
  return baseUrl
}

export const getAppUrl = (path = '') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path}`
}

export const getUploadUrl = (folderId, hash = null) => {
  const baseUrl = getBaseUrl()
  const params = new URLSearchParams({ folderId })
  if (hash) {
    params.append('hash', hash)
  }
  return `${baseUrl}/upload?${params.toString()}`
}

export const getCreateUrl = () => {
  return getAppUrl('/create')
}

export const getHomeUrl = () => {
  return getAppUrl('/')
} 