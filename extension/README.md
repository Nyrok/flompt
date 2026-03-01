# Flompt Browser Extension

Build structured AI prompts visually and inject them directly into ChatGPT, Claude, or Gemini — without leaving the page.

## Features

- **Sidebar panel** — opens on the right side of any supported AI tool
- **One-click injection** — "Send to AI" button pastes the compiled prompt directly into the chat input
- **Works on** ChatGPT, Claude, Gemini (more platforms planned)
- **Floating toggle** — quick access button always visible on supported pages
- **Privacy-first** — no data leaves your browser (besides what flompt.dev already sends)

## Supported Platforms

| Platform | URL |
|----------|-----|
| ChatGPT  | `chatgpt.com`, `chat.openai.com` |
| Claude   | `claude.ai` |
| Gemini   | `gemini.google.com` |

## Installation (Development)

### Chrome / Edge

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `/extension` folder

### Firefox

1. Open Firefox and go to `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select `/extension/manifest.json`

> **Note**: Firefox uses Manifest V3 with some differences. The extension works as-is but is primarily developed for Chrome.

## How It Works

1. Visit ChatGPT, Claude, or Gemini
2. Click the ⚡ floating button (bottom-right) **or** the extension icon in your toolbar
3. The Flompt sidebar opens on the right
4. Build your prompt visually (decompose → edit blocks → compile)
5. Click **Send to AI →** to inject the compiled prompt into the chat input
6. Hit Enter in the AI tool — done!

## Architecture

```
extension/
├── manifest.json        # MV3 manifest
├── background.js        # Service worker — handles toolbar icon click
├── content-script.js    # Injected into AI pages — sidebar + injection logic
├── content-script.css   # Sidebar + button styles
└── icons/               # PNG icons (16, 32, 48, 128px)
```

The sidebar is an iframe loading `https://flompt.dev/?extension=1`. The `?extension=1` param makes the app show a **Send to AI** button instead of the regular copy button.

When the user clicks "Send to AI", the app sends a `postMessage` to `window.parent`:
```js
window.parent.postMessage({ type: 'FLOMPT_INJECT', prompt: '...' }, '*')
```

The content script catches this message and injects the text into the detected input field.

