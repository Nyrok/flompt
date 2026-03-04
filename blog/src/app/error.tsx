'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 12,
        fontFamily: 'system-ui',
        color: '#f0f0f0',
        background: '#1c1c1e',
      }}
    >
      <span style={{ fontSize: '2rem' }}>⬡</span>
      <p style={{ fontWeight: 600 }}>Something went wrong.</p>
      <button
        onClick={reset}
        style={{
          padding: '8px 18px',
          borderRadius: 8,
          background: '#FF3570',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </div>
  )
}
