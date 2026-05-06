import { useEffect, useRef } from 'react'

export const useClickOutside = (ref, callback) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) callbackRef.current()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref])
}