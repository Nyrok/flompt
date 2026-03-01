/**
 * flompt — integrations registry
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ADD A NEW WEBSITE
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Create  integrations/yoursite.js  (copy chatgpt.js as a template).
 *    Fill in:
 *      name             – display name (shown in the sidebar header)
 *      hostnames        – array of strings matched against location.hostname
 *      getInput()       – returns the contenteditable composer element, or null
 *      getSendBtn()     – returns the send button, or null
 *      getToolbarTarget() (optional) – returns { el, position } for precise
 *                         button placement; omit to use the generic search.
 *      onButtonMounted(btn) (optional) – styling / alignment tweaks after
 *                         the toggle button is inserted.
 *
 * 2. Import and add it to the array below.
 *
 * 3. Add the new hostname to host_permissions in manifest.json (and
 *    manifest.firefox.json) and to the content_scripts.matches array.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import chatgpt from './chatgpt.js'
import claude  from './claude.js'
import gemini  from './gemini.js'

export default [chatgpt, claude, gemini]
