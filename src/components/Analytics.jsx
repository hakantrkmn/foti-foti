import { Analytics } from '@vercel/analytics/react'

export const VercelAnalytics = () => {
  return (
    <Analytics 
      mode="production"
      debug={import.meta.env.DEV}
    />
  )
} 