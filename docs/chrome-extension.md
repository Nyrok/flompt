# Chrome Extension

The flompt Chrome extension embeds the full prompt builder as a sidebar directly inside ChatGPT, Claude, and Gemini. Build and inject structured prompts without leaving your AI chat.

---

## Installation

### Chrome Web Store (recommended)

Install in one click. No developer mode, no zip file:

→ **[Add to Chrome](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc)**

Once installed, navigate to ChatGPT, Claude, or Gemini. The **✦ flompt** button appears in the input toolbar.

### Developer installation (unpacked)

For local development or testing unreleased builds:

1. Clone the repo or download the source from [GitHub](https://github.com/Nyrok/flompt)
2. Run `make pack` inside the `/extension` folder to build the zip
3. Open `chrome://extensions/` → enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `/extension` folder

---

## How it works

### The ✦ Enhance button

The extension injects a **✦** button just before the send button in each platform's input toolbar. Clicking it opens the flompt sidebar (440px wide, slides in from the right).

The button label updates automatically based on the active platform:
- **✦ Enhance on ChatGPT**
- **✦ Enhance on Claude**
- **✦ Enhance on Gemini**

### The sidebar

The sidebar loads `flompt.dev/app/?extension=1` in a sandboxed `<iframe>`. In extension mode:
- The app header is hidden to maximize canvas space
- An **Import** button appears to pull the current chat input into flompt for decomposition
- A **Send to AI** button replaces the standard Copy button

### Bidirectional sync

| Direction | Action |
|---|---|
| **Chat → flompt** | Click **Import** to pull the current input content into the decomposer |
| **flompt → Chat** | Click **Send to AI** to inject the assembled XML prompt into the input |

When you click **Send to AI**, the assembled prompt is sent via `postMessage` to the content script, which injects it into the platform's `contenteditable` input, ready to send.

---

## Supported platforms

| Platform | Status |
|---|---|
| **ChatGPT** | ✅ Supported |
| **Claude** | ✅ Supported |
| **Gemini** | ✅ Supported |

If a platform updates its UI (selector changes), the extension falls back to a DOM traversal algorithm that walks up from the input element (up to 12 levels) to find the send button. A floating fallback button (bottom-right) is shown as a last resort.

---

## Permissions

The extension requests the following permissions:

| Permission | Reason |
|---|---|
| `activeTab` | Access the current tab to inject the sidebar |
| `scripting` | Inject the content script into supported pages |
| `storage` | Persist sidebar open/close state |
| Host access for `chatgpt.com`, `claude.ai`, `gemini.google.com` | Inject the button on supported platforms |

The extension **does not** collect any data. All prompt content stays local or goes directly to `flompt.dev`.

---

## Resizing the sidebar

The sidebar is resizable. Drag the left edge to adjust the width between 320px and 700px. The last size is remembered.

---

## Troubleshooting

**The ✦ button doesn't appear**
- Make sure the extension is enabled in `chrome://extensions/`
- Hard reload the page (`Ctrl+Shift+R`)
- If the platform recently updated its UI, [open an issue](https://github.com/Nyrok/flompt/issues)

**"This content is blocked"**
- This should not happen on current releases. The CSP is configured to allow `chrome-extension:` in `frame-ancestors`
- If it persists, update to the latest extension release

**The Send to AI button doesn't inject the prompt**
- Make sure you're on a supported platform
- The input field must be visible and focused
