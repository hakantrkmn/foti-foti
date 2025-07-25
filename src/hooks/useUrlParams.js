import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [urlParams, setUrlParams] = useState({})

  useEffect(() => {
    const paramsObj = {}
    
    for (const [key, value] of searchParams.entries()) {
      paramsObj[key] = value
    }
    
    setUrlParams(paramsObj)
  }, [searchParams])

  const getParam = useCallback((key) => {
    return searchParams.get(key) || null
  }, [searchParams])

  const hasParam = useCallback((key) => {
    return searchParams.has(key)
  }, [searchParams])

  const clearParams = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  return {
    urlParams,
    getParam,
    hasParam,
    clearParams
  }
} 