// Configuration utilities
export const getBaseUrl = () => {
  return import.meta.env.VITE_BASE_URL || window.location.origin
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