import integrations from './integrations/index.js'

;(function () {
  // Guard against double injection
  if (window.__flomptInjected) return
  window.__flomptInjected = true

  // ── Caveat font — bundlée localement (les CSP des plateformes bloquent Google Fonts)
  if (!document.getElementById('flompt-caveat-font')) {
    const style = document.createElement('style')
    style.id = 'flompt-caveat-font'
    style.textContent = `@font-face {
      font-family: 'Caveat';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('${chrome.runtime.getURL('fonts/caveat-bold.woff2')}') format('woff2');
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

  /** Mappe le nom de la plateforme vers le format de sortie attendu */
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

  /** Lit le texte courant de l'input de la plateforme */
  function getInputText () {
    const el = platform?.getInput()
    if (!el) return ''
    // innerText > textContent : gère mieux les sauts de ligne et le texte visible
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

  // ── Import manuel: plateforme → iframe (déclenché par bouton dans l'app) ───
  /**
   * Lit le texte de l'input plateforme et l'envoie une fois à l'iframe.
   * Appelé uniquement sur demande explicite (FLOMPT_SYNC_REQUEST).
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

  // ── Push layout : rétrécit le contenu de la page pour faire place à la sidebar ──
  //
  // Stratégie :
  //  1. `body > :not(flompt-*)` → max-width: calc(100vw - sidebarWidth)
  //     Cible le container root de la plateforme (ex: #__next de ChatGPT)
  //  2. `html, body` → overflow-x: hidden (évite le scroll horizontal)
  //  3. Transition synchronisée avec l'animation de la sidebar (0.3s)
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
      // Animer le retour avant de supprimer le style
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
      // Désactiver les pointer-events sur l'iframe : sans ça, quand la souris
      // passe dessus pendant le drag, l'iframe capture les events et le resize se bloque
      if (iframeEl) iframeEl.style.pointerEvents = 'none'

      const onMouseMove = (e) => {
        // Drag vers la gauche = augmenter la largeur
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

        // Mettre à jour le bouton flottant actif
        if (toggleBtn.classList.contains('flompt-floating') && toggleBtn.classList.contains('flompt-active')) {
          toggleBtn.style.setProperty('right', (newWidth + 20) + 'px', 'important')
        }
      }

      const onMouseUp = () => {
        document.body.style.userSelect = ''
        sidebarEl.classList.remove('flompt-resizing')
        document.body.classList.remove('flompt-resizing')
        // Restaurer les pointer-events de l'iframe
        if (iframeEl) iframeEl.style.pointerEvents = ''
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })

    return handle
  }

  // ── DOM: Header interne — style nav flompt.dev (Caveat + accent) ─────────────
  function buildSidebarHeader () {
    const header = document.createElement('div')
    header.id = 'flompt-header'

    // Brand "flompt" en Caveat — identique au nav du vrai site
    const title = document.createElement('span')
    title.id          = 'flompt-header-title'
    title.textContent = 'flompt'

    // Bouton close — clairement à l'intérieur de l'extension
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

  // ── DOM: Sidebar — header interne + iframe + resize handle ────────────────
  function buildSidebar () {
    const sidebar = document.createElement('div')
    sidebar.id = 'flompt-sidebar'

    // Splash screen — visible pendant le chargement
    const splash = document.createElement('div')
    splash.id = 'flompt-splash'
    const splashInner = document.createElement('div')
    splashInner.id = 'flompt-splash-inner'
    const splashImg = document.createElement('img')
    splashImg.id = 'flompt-splash-icon'
    splashImg.src = chrome.runtime.getURL('icons/icon.svg')
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
      // Envoie le nom de la plateforme dès le chargement — le bouton affiche
      // "Import from Claude" immédiatement sans attendre le premier clic
      // Inclut aussi le format optimal pour cette plateforme
      if (platform?.name) {
        iframeEl.contentWindow.postMessage({
          type: 'FLOMPT_PLATFORM_INFO',
          platform: platform.name,
          format: PLATFORM_FORMAT[platform.name] || 'claude',
        }, '*')
      }
    })

    // Header interne (close button visible à l'intérieur)
    const header      = buildSidebarHeader()
    // Resize handle (bord gauche)
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

    // Bouton flottant : déplacer à gauche de la sidebar
    if (toggleBtn.classList.contains('flompt-floating')) {
      toggleBtn.style.setProperty('right', (currentSidebarWidth + 20) + 'px', 'important')
    }

    // Pas de sync automatique — l'user déclenche l'import manuellement
  }

  function closeSidebar () {
    sidebarOpen = false
    sidebarEl?.classList.remove('flompt-open')
    removePageShift()
    toggleBtn?.classList.remove('flompt-active')

    // Restaurer la position du bouton flottant
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
  // Icône Sparkles (Lucide) inline — pas d'img pour éviter les conflits de style
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
  // stopPropagation critique : évite de déclencher les handlers parents
  // (ex: file upload label sur ChatGPT, overlay Gemini, etc.)
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    e.preventDefault()
    toggleSidebar()
  })

  // ── Tooltip custom centré — remplace le title natif (mal positionné sur Claude) ──
  toggleBtn.addEventListener('mouseenter', () => {
    if (document.getElementById('flompt-toggle-tooltip')) return
    const rect = toggleBtn.getBoundingClientRect()
    const tip  = document.createElement('div')
    tip.id = 'flompt-toggle-tooltip'
    tip.textContent = 'Enhance'
    document.body.appendChild(tip)
    // Centrer horizontalement après insertion (pour connaître la largeur réelle)
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
    // Cacher le tooltip au clic (la sidebar s'ouvre)
    const tip = document.getElementById('flompt-toggle-tooltip')
    if (tip) tip.remove()
  }, true)

  // ── Insertion du toggle — zone outils de la toolbar ─────────────────────
  //
  // Stratégie :
  //   1. Trouver le bouton Send pour localiser le toolbar général
  //   2. Identifier les boutons "outils" (tout sauf send/voice/mic)
  //   3. Insérer flompt APRÈS le premier bouton outil (zone outils native)
  //   4. Fallback : juste avant le bouton send
  //   5. Fallback final : bouton flottant

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
   * Trouve le premier bouton "outil" dans la toolbar (attach, search, tools…).
   * Exclut send, voice/mic/record — remonte depuis le sendBtn pour trouver
   * un niveau contenant à la fois des outils ET le bouton send.
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

      // Bon niveau : contient des outils ET un bouton send-like
      if (toolBtns.length > 0 && allBtns.some(isSendLike)) {
        return toolBtns[0]
      }
      toolbar = toolbar.parentElement
    }
    return null
  }

  function tryInsertInToolbar () {
    if (toggleBtn.isConnected) return true

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
      platform?.onButtonMounted?.(toggleBtn)
      return true
    }

    // ── Essai 1 : zone outils ─────────────────────────────────────────────
    const firstTool = findFirstToolBtn()
    if (firstTool) {
      let container = firstTool.parentElement
      // Éviter les <label> (file input) et <a>
      while (container && (container.tagName === 'LABEL' || container.tagName === 'A')) {
        container = container.parentElement
      }
      if (container) {
        // Insérer juste après le premier bouton outil — intégré dans la zone outils
        container.insertBefore(toggleBtn, firstTool.nextSibling)
        platform?.onButtonMounted?.(toggleBtn)
        return true
      }
    }

    // ── Essai 2 : fallback juste avant le bouton send ─────────────────────
    const sendBtn = platform?.getSendBtn?.() || findSendBtnByTraversal()
    if (!sendBtn) return false

    let container = sendBtn.parentElement
    while (container && (container.tagName === 'LABEL' || container.tagName === 'A')) {
      container = container.parentElement
    }
    if (!container) return false

    container.insertBefore(toggleBtn, sendBtn)
    platform?.onButtonMounted?.(toggleBtn)
    return true
  }

  // Retry avec timer unique (pas de race condition)
  let mountTimer    = null
  let mountAttempts = 0

  function scheduleMount (delay = 500) {
    clearTimeout(mountTimer)
    mountTimer = setTimeout(mountToggleBtn, delay)
  }

  function mountToggleBtn () {
    if (tryInsertInToolbar()) return

    if (++mountAttempts >= 20) {
      // Fallback définitif : bouton flottant bas-droite
      if (!toggleBtn.isConnected) {
        toggleBtn.classList.add('flompt-floating')
        document.body.appendChild(toggleBtn)
      }
      return
    }

    scheduleMount(500)
  }

  // Lancement immédiat
  scheduleMount(0)

  // Ré-insertion si le bouton disparaît (navigation SPA)
  setInterval(() => {
    if (!toggleBtn.isConnected) {
      mountAttempts = 0
      scheduleMount(200)
    }
  }, 2000)

  // ── Live update : app → plateforme (brut, sans toast ni fermeture) ──────────
  //
  // execCommand est la seule voie universelle (React, ProseMirror, Angular) —
  // textContent seul est écrasé par le virtual DOM de ces frameworks.
  //
  // Flow :
  //  1. el.focus() + selectAll + execCommand('insertText') → remplace TOUT le contenu
  //  2. Fallback beforeinput/textContent/input si execCommand échoue
  //  3. iframeEl.focus() — opération DOM locale (pas cross-origin), synchrone
  //     Le browser route le focus vers le dernier élément actif dans l'iframe,
  //     l'user peut continuer à taper sans interruption perceptible
  function liveUpdatePlatformInput (text) {
    const el = platform?.getInput()
    if (!el) return

    // Écho : l'app renvoie ce qu'elle vient de recevoir — rien à faire
    if (getInputText() === text) return

    try {
      lastSentText = text

      // Sauvegarder AVANT el.focus() — détermine si on doit rendre le focus à l'iframe
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

      // Rendre le focus à l'iframe seulement si l'user y était
      // Si l'user tapait dans la plateforme → ne pas lui voler le focus
      if (!platformHasFocus) iframeEl?.focus()

    } catch (err) {
      console.error('[flompt] Live update error:', err)
    }
  }

  // ── Messages depuis l'iframe flompt ────────────────────────────────────────
  window.addEventListener('message', (event) => {
    if (event.origin !== FLOMPT_ORIGIN) return

    const { type, prompt, text } = event.data ?? {}

    // Sync brute app → plateforme en temps réel (sans fermer la sidebar)
    if (type === 'FLOMPT_LIVE_UPDATE' && typeof text === 'string') {
      liveUpdatePlatformInput(text)
    }

    // Injection finale du prompt compilé dans la plateforme (+ fermeture)
    if (type === 'FLOMPT_INJECT' && typeof prompt === 'string') {
      injectPrompt(prompt)
    }

    // Fermeture de la sidebar depuis l'app
    if (type === 'FLOMPT_CLOSE') {
      closeSidebar()
    }

    // L'user clique "Import prompt" dans l'app → on lit et envoie l'input plateforme
    if (type === 'FLOMPT_SYNC_REQUEST') {
      sendPlatformInputToIframe()
    }
  })

  // ── Message depuis le service worker (clic icône toolbar) ─────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'FLOMPT_TOGGLE') toggleSidebar()
  })

  // ── Injection du prompt dans l'input de la plateforme ─────────────────────
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
        platform.inject(el, text)
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
