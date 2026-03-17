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

    // Session replay — always on, mask prompt content (privacy)
    disable_session_recording: false,
    session_recording: {
      maskAllInputs:              false,               // keep most inputs visible
      maskInputOptions:           { textarea: true },  // mask prompt textarea only
      recordCrossOriginIframes:   false,
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
  // App lifecycle
  appLoaded: (props: { view_mode: string; locale: string; is_returning_user: boolean; source: string }) =>
    track('app_loaded', props),

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

  // View
  viewToggled: (to: 'list' | 'canvas')                => track('view_toggled',    { to }),

  // Blocks
  blockAdded:   (type: string)                        => track('block_added',     { type }),
  blockDeleted: (type: string)                        => track('block_deleted',   { type }),

  // Audit
  auditOpened:     ()                                 => track('audit_opened'),
  auditBlockAdded: (type: string)                     => track('audit_block_added', { type }),

  // Score / Critic
  scoreOpened: ()                                     => track('score_opened'),

  // Output
  outputFormatChanged: (format: string)               => track('output_format_changed', { format }),

  // Template library
  libraryOpened:   ()                                 => track('library_opened'),
  templateApplied: (id: string, category: string)    => track('template_applied', { template_id: id, category }),

  // Version history
  versionPanelOpened: ()                             => track('version_panel_opened'),
  versionSaved:       (versionNum: number)           => track('version_saved',    { version_num: versionNum }),
  versionRestored:    (versionNum: number)           => track('version_restored', { version_num: versionNum }),
  versionDiffViewed:  ()                             => track('version_diff_viewed'),

  // Settings
  localeChanged: (locale: string)                     => track('locale_changed',  { locale }),

  // GitHub
  githubClicked: (source: string)                     => track('github_clicked',  { source }),

  // Make.com integration
  makePanelOpened:  ()                                                => track('make_panel_opened'),
  makeSendPrompt:   (format: string, blockCount: number, chars: number) => track('make_send_prompt', { format, block_count: blockCount, chars }),
  makeSuccess:      ()                                                => track('make_send_success'),
  makeError:        (reason: string)                                  => track('make_send_error', { reason }),

  // Projects
  projectCreated:  ()                     => track('project_created'),
  projectSwitched: (name: string)         => track('project_switched', { project_name: name }),
  projectDeleted:  ()                     => track('project_deleted'),
  projectRenamed:  ()                     => track('project_renamed'),

  // Errors
  error: (context: string, message?: string)          => track('error', { context, message }),
}
