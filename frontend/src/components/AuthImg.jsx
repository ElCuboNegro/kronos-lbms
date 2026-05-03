import { useState, useEffect } from 'react'
import { getBaseUrl } from '../api/client'

export default function AuthImg({ url, fallback, ...props }) {
  const [src, setSrc] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('token')
    fetch(`${getBaseUrl()}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.blob()
      })
      .then(blob => {
        if (active) {
          const objectUrl = URL.createObjectURL(blob)
          setSrc(objectUrl)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })

    return () => {
      active = false
    }
  }, [url])

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src)
    }
  }, [src])

  if (error && fallback) {
    return fallback
  }

  if (!src) {
    return <div style={{ ...props.style, background: 'var(--theme-surface)' }} />
  }

  return <img src={src} {...props} />
}
