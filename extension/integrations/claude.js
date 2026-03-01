/** @see chatgpt.js for the full integration shape */
export default {
  name: 'Claude',
  hostnames: ['claude.ai'],

  getInput () {
    return (
      document.querySelector('[data-testid="composer-text-input"] div[contenteditable]') ||
      document.querySelector('.ProseMirror[contenteditable]') ||
      document.querySelector('div[contenteditable="true"].ProseMirror') ||
      // Fallback: LAST contenteditable — the input is at the bottom of the page,
      // not inside message bubbles, so the last one is always the composer.
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

  // No getToolbarTarget — the generic first-tool-button search works fine on Claude.

  onButtonMounted (btn) {
    // Claude's toolbar uses inline-flex; without it the button is vertically misaligned.
    const parent = btn.parentElement
    if (parent) parent.classList.add('inline-flex')
    // Reduce to 32 × 32 to match Claude's native toolbar button size.
    btn.style.setProperty('width',  '32px', 'important')
    btn.style.setProperty('height', '32px', 'important')
  },
}
