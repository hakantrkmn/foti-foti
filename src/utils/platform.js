export const getPlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  
  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'ios'
  }
  
  // Android detection
  if (/android/i.test(userAgent)) {
    return 'android'
  }
  
  // Desktop detection
  return 'desktop'
}

export const isMobile = () => {
  const platform = getPlatform()
  return platform === 'ios' || platform === 'android'
}

export const isIOS = () => {
  return getPlatform() === 'ios'
}

export const isAndroid = () => {
  return getPlatform() === 'android'
}

export const getPlatformInfo = () => {
  return {
    platform: getPlatform(),
    userAgent: navigator.userAgent,
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid()
  }
} 