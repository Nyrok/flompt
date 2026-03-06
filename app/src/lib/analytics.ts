/// <reference types="vite/client" />
/**
 * analytics.ts — PostHog wrapper
 *
 * - Init deferred after first render (non-blocking)
 * - Session replay ON — textarea content masked (privacy)
 * - Autocapture ON — clicks, inputs, pageviews
 * - Heatmaps ON
 * - No tracking in dev
 */

import posthog from 'posthog-js'

const KEY  = import.meta.env.VITE_POSTHOG_KEY  as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

let ready = false

export const initAnalytics = () => {
  if (!KEY || ready) return
  ready = true

  posthog.init(KEY, {
    api_host:          HOST,
    capture_pageview:  true,
    capture_pageleave: true,
    autocapture:       true,
    request_batching:  true,

    // Session replay — mask prompt content (privacy)
    session_recording: {
      maskAllInputs:      false,               // keep most inputs visible
      maskInputOptions:   { textarea: true },  // mask prompt textarea only
      recordCrossOriginIframes: false,
    },

    // Heatmaps
    enable_heatmaps: true,

    // Exception autocapture — track JS errors in PostHog
    capture_exceptions: true,

    // Drop "Script error." events — caused by cross-origin scripts (e.g. ChatGPT,
    // Claude, Gemini) throwing errors that the browser masks for security reasons.
    // These have no stack trace and no actionable info, so they're pure noise.
    before_send: (event) => {
      if (event?.event === '$exception') {
        const list = event?.properties?.['$exception_list'] as Array<{ value?: string }> | undefined
        const isScriptError = list?.every(e => !e.value || e.value === 'Script error.')
        if (isScriptError) return null
      }
      return event
    },

    loaded: (ph) => {
      if (import.meta.env.DEV as boolean) {
        ph.opt_out_capturing()
      } else {
        ph.startSessionRecording()
      }
    },
  })
}

/** Fire-and-forget event — never throws */
export const track = (event: string, props?: Record<string, unknown>) => {
  try { posthog.capture(event, props) } catch { /* silent */ }
}

/**
 * Register super properties — attached to every subsequent PostHog event.
 * - source     : 'web' | 'extension'
 * - ai_platform: 'ChatGPT' | 'Claude' | 'Gemini' (extension only, set once known)
 */
export const setSource = (source: 'web' | 'extension', aiPlatform?: string) => {
  try {
    const props: Record<string, string> = { source }
    if (aiPlatform) props.ai_platform = aiPlatform
    posthog.register(props)
  } catch { /* silent */ }
}

// ── Typed event helpers ───────────────────────────────────────────────────────

export const analytics = {
  // Tour
  tourStarted:    ()                                  => track('tour_started'),
  tourStep:       (step: number, title: string)       => track('tour_step',       { step, title }),
  tourCompleted:  ()                                  => track('tour_completed'),
  tourSkipped:    (atStep: number)                    => track('tour_skipped',    { at_step: atStep }),

  // Core actions
  decomposeClicked:   ()                              => track('decompose_clicked'),
  decomposeCompleted: (blockCount: number)            => track('decompose_completed', { block_count: blockCount }),
  compileClicked:     ()                              => track('compile_clicked'),
  compileCompleted:   (tokenEstimate: number)         => track('compile_completed',   { token_estimate: tokenEstimate }),
  promptCopied:       ()                              => track('prompt_copied'),
  promptExported:     (format: 'txt' | 'json')        => track('prompt_exported',     { format }),

  // Blocks
  blockAdded:   (type: string)                        => track('block_added',     { type }),
  blockDeleted: (type: string)                        => track('block_deleted',   { type }),

  // Settings
  localeChanged: (locale: string)                     => track('locale_changed',  { locale }),

  // GitHub
  githubClicked: (source: string)                     => track('github_clicked',  { source }),

  // Errors
  error: (context: string, message?: string)          => track('error', { context, message }),
}
