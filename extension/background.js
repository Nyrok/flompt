// background.js — Service worker
// Toggle the flompt sidebar when the extension icon is clicked

// Cross-browser API compatibility (Chrome / Firefox / Safari)
const browser = globalThis.browser ?? globalThis.chrome

browser.action.onClicked.addListener((tab) => {
  browser.tabs.sendMessage(tab.id, { type: 'FLOMPT_TOGGLE' }).catch(() => {
    // Content script not yet injected on this tab — ignore
  })
})
