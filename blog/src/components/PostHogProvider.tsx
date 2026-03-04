'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  // Init once — deferred, non-blocking
  useEffect(() => {
    if (!KEY || posthog.__loaded) return
    posthog.init(KEY, {
      api_host:          HOST,
      autocapture:       true,
      capture_pageview:  false, // manual below
      capture_pageleave: true,
      enable_heatmaps:   true,
      capture_exceptions: true, // error tracking
      session_recording: {
        maskAllInputs: false,
      },
    })
  }, [])

  // Track page views on route change
  useEffect(() => {
    if (!KEY) return
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return <>{children}</>
}
