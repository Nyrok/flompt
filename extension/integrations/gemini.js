/** @see chatgpt.js for the full integration shape */
export default {
  name: 'Gemini',
  hostnames: ['gemini.google.com'],

  getInput () {
    return (
      document.querySelector('rich-textarea div[contenteditable]') ||
      document.querySelector('rich-textarea [contenteditable="true"]') ||
      // Fallback: LAST contenteditable (same rationale as Claude)
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
    // Insert at index 1 inside .leading-actions-wrapper (after the first native button)
    const el = document.querySelector('.leading-actions-wrapper')
    return el ? { el, position: 1 } : null
  },

  onButtonMounted (btn) {
    // Gemini uses pill-shaped buttons in the leading actions area
    btn.style.setProperty('border-radius', '50px', 'important')
  },
}
