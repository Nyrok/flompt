import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import posthog from 'posthog-js'
import { track } from '@/lib/analytics'

interface Props  { children: ReactNode }
interface State  { crashed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false }

  componentDidCatch(error: Error, info: ErrorInfo) {
    posthog.captureException(error, {
      component: info.componentStack?.split('\n')[1]?.trim(),
    })
    track('app_crash', {
      message:    error.message,
      stack:      error.stack?.slice(0, 500),
      component:  info.componentStack?.split('\n')[1]?.trim(),
    })
    console.error('[flompt] crash', error, info)
  }

  static getDerivedStateFromError(): State {
    return { crashed: true }
  }

  render() {
    if (this.state.crashed) {
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:12, fontFamily:'system-ui', color:'#f0f0f0', background:'#1c1c1e' }}>
          <span style={{ fontSize:'2rem' }}>⬡</span>
          <p style={{ fontWeight:600 }}>Something went wrong.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding:'8px 18px', borderRadius:8, background:'#FF3570', color:'#fff', border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:600 }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
