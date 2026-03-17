# Privacy & Data Retention

**Local-first**. Prompts stay in your browser. Unless you export or send to Make.com, Claude, etc.

---

## What stays local

| Data | Where it lives |
|---|---|
| Canvas state (blocks, edges, positions) | `localStorage` |
| Project workspaces | `localStorage` (per project ID) |
| Compiled prompt output | `localStorage` (per project) |
| Make.com webhook URL | `localStorage` (`flompt-make`) |
| Make.com execution history | `localStorage` (`flompt-make`) |
| Interface language preference | `localStorage` |

None of this data is transmitted to flompt's servers. flompt's backend (FastAPI) is only called during the **Decompose** step — and only the raw text you paste into the decomposer input is sent, for the duration of that API call.

---

## What the backend receives

When you click **Decompose into blocks**, flompt sends:

- The raw prompt text you pasted
- Nothing else — no canvas state, no project data, no browsing history

The backend processes the text, returns structured blocks, and discards the input. There is no logging of prompt content on the server.

---

## What the extension sends

When you click **Send to AI** in the browser extension, the assembled prompt is sent via `postMessage` to the content script, which injects it into the AI platform's input. It does not go through flompt's servers.

When you click **Send to Make.com**, your browser posts directly to your Make webhook URL. It does not go through flompt's servers.

---

## No accounts, no tracking

- **No sign-up** required, ever
- **No analytics** on prompt content
- **No cookies** for tracking
- **No data retention policy** — because there is no data to retain

This is intentional. Prompts often contain sensitive information — internal product details, customer data, proprietary processes, personal context. That content should stay on your machine.

---

## Export = your backup

Since everything lives in `localStorage`, clearing your browser data will erase your projects. **Export any project you want to keep** before clearing browser storage.

Projects can be exported as JSON files from the project dropdown. See [Projects → Export](./projects.md#export-a-project).

---

## Self-hosting

If you want complete control over the backend, flompt is fully self-hostable under the MIT license.

```bash
git clone https://github.com/Nyrok/flompt
cd flompt
docker compose up
```

→ [Full self-hosting instructions](https://github.com/Nyrok/flompt#self-hosting)
