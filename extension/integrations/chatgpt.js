/**
 * ChatGPT integration
 *
 * Integration shape:
 *   name             {string}   Display name shown in the sidebar header
 *   hostnames        {string[]} Substrings matched against location.hostname
 *   getInput()       Returns the contenteditable input element, or null
 *   getSendBtn()     Returns the send button element, or null
 *   getToolbarTarget() Returns { el, position } where to insert the toggle button,
 *                      or null to fall back to the generic toolbar search.
 *                      position: 'prepend' | 'append' | number (child index)
 *   onButtonMounted(btn) Optional hook called after the button is inserted —
 *                        use for platform-specific sizing / styling tweaks.
 */
export default {
  name: 'ChatGPT',
  hostnames: ['chatgpt.com', 'openai.com'],

  getInput () {
    return (
      document.querySelector('#prompt-textarea[contenteditable]') ||
      document.querySelector('#prompt-textarea') ||
      document.querySelector('div[contenteditable="true"][data-virtualized="false"]')
    )
  },

  getSendBtn () {
    return (
      document.querySelector('button[data-testid="send-button"]') ||
      document.querySelector('button[aria-label="Send prompt"]') ||
      document.querySelector('button[aria-label="Send message"]')
    )
  },

  getToolbarTarget () {
    // Target: span inside the [grid-area:leading] div in the composer form
    // CSS: #thread-bottom form > div:nth-child(2) > div > div.[grid-area:leading] > span
    const el = document.querySelector(
      '#thread-bottom form div[class*="[grid-area:leading]"] > span'
    )
    return el ? { el, position: 'append' } : null
  },
}
