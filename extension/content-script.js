;(function () {
  // ── Integrations (inlined — no ES module imports in content scripts) ────────
  const integrations = [
    {
      name: 'ChatGPT',
      hostnames: ['chatgpt.com', 'openai.com'],
      getInput () {
        return (
          document.querySelector('#prompt-textarea[contenteditable]') ||
          document.querySelector('#prompt-textarea') ||
          document.querySelector('div[contenteditable="true"][data-virtualized="false"]') ||
          document.querySelector('div[contenteditable="true"][id*="prompt"]') ||
          [...document.querySelectorAll('div[contenteditable="true"]')].at(-1)
        )
      },
      getSendBtn () {
        return (
          document.querySelector('button[data-testid="send-button"]') ||
          document.querySelector('button[aria-label="Send prompt"]') ||
          document.querySelector('button[aria-label="Send message"]') ||
          document.querySelector('button[aria-label*="Send"]') ||
          document.querySelector('button[type="submit"]')
        )
      },
      getToolbarTarget () {
        const el =
          document.querySelector('#thread-bottom form div[class*="[grid-area:leading]"] > span') ||
          document.querySelector('form div[class*="[grid-area:leading]"] > span')                ||
          document.querySelector('form div[class*="leading"] > span[class]')                     ||
          document.querySelector('#thread-bottom form > div > div > span')                       ||
          null
        return el ? { el, position: 'append' } : null
      },
    },
    {
      name: 'Claude',
      hostnames: ['claude.ai'],
      getInput () {
        return (
          document.querySelector('[data-testid="composer-text-input"] div[contenteditable]') ||
          document.querySelector('.ProseMirror[contenteditable]') ||
          document.querySelector('div[contenteditable="true"].ProseMirror') ||
          [...document.querySelectorAll('[contenteditable="true"]')].at(-1) ||
          [...document.querySelectorAll('[contenteditable]')].at(-1)
        )
      },
      getSendBtn () {
        return (
          document.querySelector('button[aria-label="Send Message"]') ||
          document.querySelector('button[aria-label="Send message"]') ||
          document.querySelector('[data-testid="send-button"]')
        )
      },
      onButtonMounted (btn) {
        const parent = btn.parentElement
        if (parent) parent.classList.add('inline-flex')
        btn.style.setProperty('width',  '32px', 'important')
        btn.style.setProperty('height', '32px', 'important')
      },
    },
    {
      name: 'Gemini',
      hostnames: ['gemini.google.com'],
      getInput () {
        return (
          document.querySelector('rich-textarea div[contenteditable]') ||
          document.querySelector('rich-textarea [contenteditable="true"]') ||
          [...document.querySelectorAll('[contenteditable="true"]')].at(-1)
        )
      },
      getSendBtn () {
        return (
          document.querySelector('button.send-button') ||
          document.querySelector('button[aria-label="Send message"]') ||
          document.querySelector('button[mattooltip="Send message"]')
        )
      },
      getToolbarTarget () {
        const el = document.querySelector('.leading-actions-wrapper')
        return el ? { el, position: 1 } : null
      },
      onButtonMounted (btn) {
        btn.style.setProperty('border-radius', '50px', 'important')
      },
    },
  ]

  // Guard against double injection
  if (window.__flomptInjected) return
  window.__flomptInjected = true

  // Cross-browser API compatibility (Chrome / Firefox / Safari)
  const browser = globalThis.browser ?? globalThis.chrome

  // ── Caveat font — bundled locally (platform CSPs block Google Fonts)
  if (!document.getElementById('flompt-caveat-font')) {
    const style = document.createElement('style')
    style.id = 'flompt-caveat-font'
    style.textContent = `@font-face {
      font-family: 'Caveat';
      font-style: normal;
      font-weight: 700;
      font-display: block;
      src: url('${browser.runtime.getURL('fonts/caveat-bold.woff2')}') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }`
    document.head.appendChild(style)
  }

  // ── Config ─────────────────────────────────────────────────────────────────
  const DEV_MODE      = false
  const FLOMPT_URL    = DEV_MODE
    ? 'http://localhost:5173/app/?extension=1'
    : 'https://flompt.dev/app/?extension=1'
  const FLOMPT_ORIGIN = DEV_MODE
    ? 'http://localhost:5173'
    : 'https://flompt.dev'

  const SIDEBAR_W_DEFAULT = 440
  const SIDEBAR_W_MIN     = 300
  const SIDEBAR_W_MAX     = 900

  // ── Platform detection ─────────────────────────────────────────────────────
  const hostname = location.hostname

  /** Active integration for this page, or null if unsupported. */
  const platform = integrations.find(i =>
    i.hostnames.some(h => hostname.includes(h))
  ) || null

  /** Maps the platform name to the expected output format */
  const PLATFORM_FORMAT = {
    ChatGPT: 'chatgpt',
    Claude:  'claude',
    Gemini:  'gemini',
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setContentEditable (el, text) {
    el.focus()

    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(el)
    selection.removeAllRanges()
    selection.addRange(range)

    const inserted = document.execCommand('insertText', false, text)

    if (!inserted || el.textContent.trim() !== text.trim()) {
      const beforeInput = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertReplacementText',
        data: text,
      })
      el.dispatchEvent(beforeInput)

      if (!beforeInput.defaultPrevented) {
        el.textContent = text
      }

      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
    }

    setTimeout(() => el.dispatchEvent(new Event('change', { bubbles: true })), 50)
  }

  /** Reads the current text from the platform input */
  function getInputText () {
    const el = platform?.getInput()
    if (!el) return ''
    // innerText > textContent : handles line breaks and visible text better
    const text = el.value ?? el.innerText ?? el.textContent ?? ''
    if (DEV_MODE) console.log('[flompt] getInputText el:', el.tagName, el.className?.slice(0, 40), '→', JSON.stringify(text?.slice(0, 60)))
    return text
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let sidebarOpen         = false
  let sidebarEl           = null
  let iframeEl            = null
  let iframeReady         = false
  let currentSidebarWidth = SIDEBAR_W_DEFAULT
  let pageShiftStyle      = null
  let lastSentText        = ''

  // ── Manual import: platform → iframe (triggered by button in the app) ───
  /**
   * Reads the platform input text and sends it once to the iframe.
   * Called only on explicit request (FLOMPT_SYNC_REQUEST).
   */
  function sendPlatformInputToIframe () {
    if (!iframeEl?.contentWindow || !iframeReady) return
    const text = getInputText()
    iframeEl.contentWindow.postMessage({
      type: 'FLOMPT_PLATFORM_INPUT',
      text,
      platform: platform?.name || 'Unknown',
    }, '*')
  }

  // ── Push layout: shrinks page content to make room for the sidebar ──
  //
  // Strategy:
  //  1. `body > :not(flompt-*)` → max-width: calc(100vw - sidebarWidth)
  //     Targets the platform's root container (e.g. ChatGPT's #__next)
  //  2. `html, body` → overflow-x: hidden (prevents horizontal scroll)
  //  3. Transition synchronized with the sidebar animation (0.3s)
  //
  const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const EXCL = ':not(#flompt-sidebar):not(#flompt-toast):not(#flompt-toggle-tooltip):not(#flompt-toggle)'

  function applyPageShift (width) {
    if (!pageShiftStyle) {
      pageShiftStyle = document.createElement('style')
      pageShiftStyle.id = 'flompt-page-shift'
      document.head.appendChild(pageShiftStyle)
    }
    pageShiftStyle.textContent = `
      html, body { overflow-x: hidden !important; }
      body { margin-right: ${width}px !important; transition: margin-right 0.3s ${EASE} !important; }
      body > ${EXCL} {
        max-width: calc(100vw - ${width}px) !important;
        transition: max-width 0.3s ${EASE} !important;
      }
    `
  }

  function removePageShift () {
    if (pageShiftStyle) {
      // Animate the return before removing the style
      pageShiftStyle.textContent = `
        body { margin-right: 0px !important; transition: margin-right 0.3s ${EASE} !important; }
        body > ${EXCL} {
          max-width: 100vw !important;
          transition: max-width 0.3s ${EASE} !important;
        }
      `
      setTimeout(() => {
        pageShiftStyle?.remove()
        pageShiftStyle = null
      }, 320)
    }
  }

  // ── DOM: Resize handle (bord gauche de la sidebar) ─────────────────────────
  function buildResizeHandle () {
    const handle = document.createElement('div')
    handle.id = 'flompt-resize-handle'

    let startX    = 0
    let startWidth = 0

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault()
      startX     = e.clientX
      startWidth = sidebarEl.offsetWidth

      document.body.style.userSelect = 'none'
      sidebarEl.classList.add('flompt-resizing')
      document.body.classList.add('flompt-resizing')
      // Disable pointer-events on the iframe: without this, when the mouse
      // passes over it during drag, the iframe captures events and resize gets stuck
      if (iframeEl) iframeEl.style.pointerEvents = 'none'

      const onMouseMove = (e) => {
        // Drag left = increase width
        const dx       = startX - e.clientX
        const newWidth = Math.max(
          SIDEBAR_W_MIN,
          Math.min(SIDEBAR_W_MAX, Math.min(startWidth + dx, window.innerWidth * 0.9))
        )
        currentSidebarWidth = newWidth
        sidebarEl.style.setProperty('width', newWidth + 'px', 'important')

        if (sidebarOpen) {
          applyPageShift(newWidth)
        }

        // Update the active floating button
        if (toggleBtn.classList.contains('flompt-floating') && toggleBtn.classList.contains('flompt-active')) {
          toggleBtn.style.setProperty('right', (newWidth + 20) + 'px', 'important')
        }
      }

      const onMouseUp = () => {
        document.body.style.userSelect = ''
        sidebarEl.classList.remove('flompt-resizing')
        document.body.classList.remove('flompt-resizing')
        // Restore pointer-events on the iframe
        if (iframeEl) iframeEl.style.pointerEvents = ''
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })

    return handle
  }

  // ── DOM: Internal header — flompt.dev nav style (Caveat + accent) ─────────────
  function buildSidebarHeader () {
    const header = document.createElement('div')
    header.id = 'flompt-header'

    // Brand "flompt" in Caveat — identical to the real site's nav
    const title = document.createElement('span')
    title.id          = 'flompt-header-title'
    title.textContent = 'flompt'

    // Close button — clearly inside the extension
    const closeBtn = document.createElement('button')
    closeBtn.id = 'flompt-header-close'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `
    closeBtn.addEventListener('click', closeSidebar)

    header.appendChild(title)
    header.appendChild(closeBtn)
    return header
  }

  // ── DOM: Sidebar — internal header + iframe + resize handle ────────────────
  function buildSidebar () {
    const sidebar = document.createElement('div')
    sidebar.id = 'flompt-sidebar'

    // Splash screen — visible while loading
    const splash = document.createElement('div')
    splash.id = 'flompt-splash'
    const splashInner = document.createElement('div')
    splashInner.id = 'flompt-splash-inner'
    const splashImg = document.createElement('img')
    splashImg.id = 'flompt-splash-icon'
    splashImg.src = browser.runtime.getURL('icons/icon.svg')
    splashImg.width = 72
    splashImg.height = 72
    splashImg.alt = ''
    splashImg.setAttribute('aria-hidden', 'true')
    const splashTitle = document.createElement('span')
    splashTitle.id = 'flompt-splash-title'
    splashTitle.textContent = 'flompt'
    splashInner.appendChild(splashImg)
    splashInner.appendChild(splashTitle)
    splash.appendChild(splashInner)

    // Iframe
    const iframe = document.createElement('iframe')
    iframe.id  = 'flompt-iframe'
    iframe.src = FLOMPT_URL
    iframe.allow = 'clipboard-write'
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads')

    iframe.addEventListener('load', () => {
      iframeReady = true
      const s = document.getElementById('flompt-splash')
      if (s) {
        s.classList.add('flompt-splash-hidden')
        setTimeout(() => s.remove(), 450)
      }
      // Send the platform name immediately on load — the button shows
      // "Import from Claude" right away without waiting for the first click
      // Also includes the optimal format for this platform
      if (platform?.name) {
        iframeEl.contentWindow.postMessage({
          type: 'FLOMPT_PLATFORM_INFO',
          platform: platform.name,
          format: PLATFORM_FORMAT[platform.name] || 'claude',
        }, '*')
      }
    })

    // Internal header (close button visible inside)
    const header      = buildSidebarHeader()
    // Resize handle (left edge)
    const resizeHandle = buildResizeHandle()

    sidebar.appendChild(resizeHandle)
    sidebar.appendChild(header)
    sidebar.appendChild(splash)
    sidebar.appendChild(iframe)
    document.body.appendChild(sidebar)

    sidebarEl = sidebar
    iframeEl  = iframe
  }

  // ── Toggle ─────────────────────────────────────────────────────────────────
  function openSidebar () {
    if (!sidebarEl) buildSidebar()
    sidebarOpen = true
    sidebarEl.classList.add('flompt-open')
    applyPageShift(currentSidebarWidth)
    toggleBtn.classList.add('flompt-active')

    // Floating button: move to the left of the sidebar
    if (toggleBtn.classList.contains('flompt-floating')) {
      toggleBtn.style.setProperty('right', (currentSidebarWidth + 20) + 'px', 'important')
    }

    // No automatic sync — the user triggers import manually
  }

  function closeSidebar () {
    sidebarOpen = false
    sidebarEl?.classList.remove('flompt-open')
    removePageShift()
    toggleBtn?.classList.remove('flompt-active')

    // Restore the floating button position
    if (toggleBtn?.classList.contains('flompt-floating')) {
      toggleBtn.style.removeProperty('right')
    }
  }

  function toggleSidebar () {
    if (sidebarOpen) closeSidebar()
    else openSidebar()
  }

  // ── DOM: Toggle button — Sparkles icon, style matching sibling buttons ───────
  const toggleBtn = document.createElement('button')
  toggleBtn.id    = 'flompt-toggle'
  toggleBtn.setAttribute('aria-label', 'Enhance with flompt')
  // Sparkles icon (Lucide) inline — no img to avoid style conflicts
  toggleBtn.innerHTML = `
    <svg id="flompt-toggle-icon" xmlns="http://www.w3.org/2000/svg"
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
      <path d="M20 3v4"/><path d="M22 5h-4"/>
      <path d="M4 17v2"/><path d="M5 18H3"/>
    </svg>
  `
  // stopPropagation is critical: avoids triggering parent handlers
  // (e.g. file upload label on ChatGPT, Gemini overlay, etc.)
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    e.preventDefault()
    toggleSidebar()
  })

  // ── Custom centered tooltip — replaces the native title (poorly positioned on Claude) ──
  toggleBtn.addEventListener('mouseenter', () => {
    if (document.getElementById('flompt-toggle-tooltip')) return
    const rect = toggleBtn.getBoundingClientRect()
    const tip  = document.createElement('div')
    tip.id = 'flompt-toggle-tooltip'
    tip.textContent = 'Enhance'
    document.body.appendChild(tip)
    // Center horizontally after insertion (to know the actual width)
    requestAnimationFrame(() => {
      const tw = tip.offsetWidth
      const th = tip.offsetHeight
      tip.style.setProperty('left', (rect.left + rect.width / 2 - tw / 2) + 'px', 'important')
      tip.style.setProperty('top',  (rect.top - th - 8) + 'px', 'important')
      tip.classList.add('flompt-tooltip-visible')
    })
  })
  toggleBtn.addEventListener('mouseleave', () => {
    const tip = document.getElementById('flompt-toggle-tooltip')
    if (!tip) return
    tip.classList.remove('flompt-tooltip-visible')
    setTimeout(() => tip.remove(), 180)
  })
  toggleBtn.addEventListener('click', () => {
    // Hide the tooltip on click (the sidebar opens)
    const tip = document.getElementById('flompt-toggle-tooltip')
    if (tip) tip.remove()
  }, true)

  // ── Toggle insertion — toolbar tools area ─────────────────────
  //
  // Strategy:
  //   1. Find the Send button to locate the general toolbar
  //   2. Identify "tool" buttons (everything except send/voice/mic)
  //   3. Insert flompt AFTER the first tool button (native tools area)
  //   4. Fallback: just before the send button
  //   5. Final fallback: floating button

  function findSendBtnByTraversal () {
    const input = platform?.getInput()
    if (!input) return null

    let ancestor = input.parentElement
    for (let depth = 0; depth < 12 && ancestor && ancestor !== document.body; depth++) {
      const buttons = Array.from(ancestor.querySelectorAll('button'))
      const sendBtn = buttons.find(b => {
        const label   = (b.getAttribute('aria-label') || b.getAttribute('title') || '').toLowerCase()
        const testid  = (b.getAttribute('data-testid') || '').toLowerCase()
        const tooltip = (b.getAttribute('mattooltip') || '').toLowerCase()
        return (
          label.includes('send') ||
          testid.includes('send') ||
          tooltip.includes('send') ||
          b.type === 'submit'
        )
      })
      if (sendBtn) return sendBtn
      ancestor = ancestor.parentElement
    }
    return null
  }

  /**
   * Finds the first "tool" button in the toolbar (attach, search, tools...).
   * Excludes send, voice/mic/record — traverses up from sendBtn to find
   * a level containing both tools AND the send button.
   */
  function findFirstToolBtn () {
    const sendBtn = platform?.getSendBtn?.() || findSendBtnByTraversal()
    if (!sendBtn) return null

    const isSendLike = (b) => {
      const text = [
        b.getAttribute('aria-label') || '',
        b.getAttribute('title')      || '',
        b.getAttribute('data-testid')|| '',
        b.getAttribute('mattooltip') || '',
      ].join(' ').toLowerCase()
      return (
        text.includes('send')   || text.includes('voice')  ||
        text.includes('record') || text.includes('speak')  ||
        text.includes('mic')    || b.type === 'submit'
      )
    }

    let toolbar = sendBtn.parentElement
    for (let i = 0; i < 10 && toolbar && toolbar !== document.body; i++) {
      const allBtns  = Array.from(toolbar.querySelectorAll('button'))
      const toolBtns = allBtns.filter(b => b !== toggleBtn && !isSendLike(b))

      // Right level: contains tools AND a send-like button
      if (toolBtns.length > 0 && allBtns.some(isSendLike)) {
        return toolBtns[0]
      }
      toolbar = toolbar.parentElement
    }
    return null
  }

  function tryInsertInToolbar () {
    // Already in toolbar (not floating) — nothing to do
    if (toggleBtn.isConnected && !toggleBtn.classList.contains('flompt-floating')) return true

    function commitInsert () {
      toggleBtn.classList.remove('flompt-floating')
      platform?.onButtonMounted?.(toggleBtn)
      return true
    }

    // ── Integration-specific target (getToolbarTarget) ────────────────────
    const target = platform?.getToolbarTarget?.()
    if (target) {
      const { el, position } = target
      if (typeof position === 'number') {
        el.insertBefore(toggleBtn, el.children[position] ?? null)
      } else if (position === 'append') {
        el.appendChild(toggleBtn)
      } else { // 'prepend' (default)
        el.insertBefore(toggleBtn, el.firstElementChild)
      }
      return commitInsert()
    }

    // ── Attempt 1: tools area ─────────────────────────────────────────────
    const firstTool = findFirstToolBtn()
    if (firstTool) {
      let container = firstTool.parentElement
      // Avoid <label> (file input) and <a>
      while (container && (container.tagName === 'LABEL' || container.tagName === 'A')) {
        container = container.parentElement
      }
      if (container) {
        // Insert just after the first tool button — integrated in the tools area
        container.insertBefore(toggleBtn, firstTool.nextSibling)
        return commitInsert()
      }
    }

    // ── Attempt 2: fallback just before the send button ─────────────────────
    const sendBtn = platform?.getSendBtn?.() || findSendBtnByTraversal()
    if (!sendBtn) return false

    let container = sendBtn.parentElement
    while (container && (container.tagName === 'LABEL' || container.tagName === 'A')) {
      container = container.parentElement
    }
    if (!container) return false

    container.insertBefore(toggleBtn, sendBtn)
    return commitInsert()
  }

  // Retry with single timer (no race condition)
  let mountTimer    = null
  let mountAttempts = 0

  function scheduleMount (delay = 500) {
    clearTimeout(mountTimer)
    mountTimer = setTimeout(mountToggleBtn, delay)
  }

  function mountToggleBtn () {
    if (tryInsertInToolbar()) return

    // First failure → show floating immediately so the button is always visible
    if (!toggleBtn.isConnected) {
      toggleBtn.classList.add('flompt-floating')
      document.body.appendChild(toggleBtn)
    }

    // Keep retrying to upgrade from floating to toolbar (up to 20 attempts)
    if (++mountAttempts < 20) scheduleMount(500)
  }

  // Immediate launch
  scheduleMount(0)

  // Re-insert if the button disappears (SPA navigation)
  setInterval(() => {
    if (!toggleBtn.isConnected) {
      mountAttempts = 0
      scheduleMount(200)
    }
  }, 2000)

  // ── Live update: app → platform (raw, without toast or close) ──────────
  //
  // execCommand is the only universal path (React, ProseMirror, Angular) —
  // textContent alone is overwritten by the virtual DOM of these frameworks.
  //
  // Flow:
  //  1. el.focus() + selectAll + execCommand('insertText') → replaces ALL content
  //  2. Fallback beforeinput/textContent/input if execCommand fails
  //  3. iframeEl.focus() — local DOM operation (not cross-origin), synchronous
  //     The browser routes focus to the last active element in the iframe,
  //     the user can continue typing without noticeable interruption
  function liveUpdatePlatformInput (text) {
    const el = platform?.getInput()
    if (!el) return

    // Echo: the app is sending back what it just received — nothing to do
    if (getInputText() === text) return

    try {
      lastSentText = text

      // Save BEFORE el.focus() — determines whether to return focus to the iframe
      const platformHasFocus = el === document.activeElement || el.contains(document.activeElement)

      el.focus()
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(el)
      sel.removeAllRanges()
      sel.addRange(range)

      const ok = document.execCommand('insertText', false, text)

      if (!ok || el.textContent.trim() !== text.trim()) {
        const bEvt = new InputEvent('beforeinput', {
          bubbles: true, cancelable: true,
          inputType: 'insertReplacementText',
          data: text,
        })
        el.dispatchEvent(bEvt)
        if (!bEvt.defaultPrevented) el.textContent = text
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
      }

      // Return focus to the iframe only if the user was there
      // If the user was typing in the platform → don't steal their focus
      if (!platformHasFocus) iframeEl?.focus()

    } catch (err) {
      console.error('[flompt] Live update error:', err)
    }
  }

  // ── Messages from the flompt iframe ────────────────────────────────────────
  window.addEventListener('message', (event) => {
    if (event.origin !== FLOMPT_ORIGIN) return

    const { type, prompt, text } = event.data ?? {}

    // Raw sync app → platform in real time (without closing the sidebar)
    if (type === 'FLOMPT_LIVE_UPDATE' && typeof text === 'string') {
      liveUpdatePlatformInput(text)
    }

    // Final injection of the compiled prompt into the platform (+ close)
    if (type === 'FLOMPT_INJECT' && typeof prompt === 'string') {
      injectPrompt(prompt)
    }

    // Sidebar close triggered from the app
    if (type === 'FLOMPT_CLOSE') {
      closeSidebar()
    }

    // User clicks "Import prompt" in the app → read and send the platform input
    if (type === 'FLOMPT_SYNC_REQUEST') {
      sendPlatformInputToIframe()
    }
  })

  // ── Message from the service worker (toolbar icon click) ─────────────────
  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'FLOMPT_TOGGLE') toggleSidebar()
  })

  // ── Prompt injection into the platform input ─────────────────────
  function injectPrompt (text) {
    if (!platform) {
      showToast('❌ Platform not detected. Try refreshing.', 'error')
      return
    }

    let attempts = 0
    const tryInject = () => {
      const el = platform.getInput()
      if (!el) {
        if (++attempts < 3) {
          setTimeout(tryInject, 500)
        } else {
          navigator.clipboard.writeText(text).then(() => {
            showToast(`Couldn't find ${platform.name} input — copied to clipboard ✓`)
          }).catch(() => {
            showToast('❌ Injection failed. Please paste manually.', 'error')
          })
        }
        return
      }

      try {
        setContentEditable(el, text)
        // Return focus to the platform input so user can hit Enter immediately
        el.focus()
        closeSidebar()
        showToast(`Prompt injected into ${platform.name} ✓`)
      } catch (err) {
        console.error('[flompt] Injection error:', err)
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied to clipboard — paste manually ✓')
        })
      }
    }

    tryInject()
  }

  // ── Toast notification ─────────────────────────────────────────────────────
  function showToast (message, type = 'success') {
    const existing = document.getElementById('flompt-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.id = 'flompt-toast'
    if (type === 'error') toast.classList.add('flompt-toast-error')
    toast.textContent = message
    document.body.appendChild(toast)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('flompt-toast-visible'))
    })

    setTimeout(() => {
      toast.classList.remove('flompt-toast-visible')
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

})()
