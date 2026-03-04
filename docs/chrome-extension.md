# Browser Extension

The flompt Chrome extension embeds the full prompt builder as a sidebar directly inside ChatGPT, Claude, and Gemini. Build and inject structured prompts without leaving your AI chat.

---

## Installation

### Download from Marketplace

The easiest way. One click, no setup required.

| Browser | Link |
|---|---|
| **Chrome** | [Add to Chrome](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc) |
| **Firefox** | [Add to Firefox](https://addons.mozilla.org/addon/flompt-visual-prompt-builder/) |

Once installed, navigate to ChatGPT, Claude, or Gemini. The **✦ flompt** button appears in the input toolbar.

### Manual installation (unpacked)

For local development, testing unreleased builds, or browsers without a store listing.

**Download the latest zip:**
→ [flompt-extension.zip](https://github.com/Nyrok/flompt/releases) (GitHub Releases)

**Or build from source:**

```bash
git clone https://github.com/Nyrok/flompt
cd flompt/extension
make pack        # Chrome → dist/flompt-extension.zip
make firefox     # Firefox → dist/flompt-firefox.zip
```

**Load in Chrome:**
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** and select the `/extension` folder

**Load in Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` inside the `/extension` folder

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
| Host access for `chatgpt.com`, `chat.openai.com`, `claude.ai`, `gemini.google.com` | Inject the content script and sidebar button on supported platforms |

No `activeTab`, `scripting`, or `storage` API permissions are requested. The content script is declared statically in the manifest and injected automatically by the browser on matched pages.

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
