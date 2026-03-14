# Make.com Integration

flompt can send your assembled prompt directly to a **Make.com webhook** with a single click — no copy-paste, no tab switching. Your prompt lands in a Make scenario as a structured JSON payload, ready to be routed into any AI module, database, or communication tool.

---

## Setup

### In Make.com

1. Create a new scenario (or open an existing one)
2. Add a **Webhooks → Custom webhook** trigger module
3. Click **Add** and give it a name
4. Copy the webhook URL Make provides

### In flompt

1. Assemble your prompt (build blocks → click **Compile**)
2. Open the **Make.com** panel in the output section
3. Paste your webhook URL — flompt validates and saves it to `localStorage`
4. Click **Test** to fire a test payload and verify the connection
5. Click **Send** — your prompt is posted to Make instantly

The webhook URL is saved locally. You only need to configure it once per browser.

---

## The Payload

When you click Send, flompt posts the following JSON to your webhook:

```json
{
  "prompt": "<role>...</role><objective>...</objective>...",
  "format": "claude",
  "blockCount": 5,
  "source": "flompt",
  "sentAt": "2026-03-14T10:42:00.000Z"
}
```

| Field | Type | Description |
|---|---|---|
| `prompt` | string | The fully assembled XML prompt |
| `format` | string | Output format (`claude`, `chatgpt`, or `raw`) |
| `blockCount` | number | Number of blocks in the prompt |
| `source` | string | Always `"flompt"` — useful for filtering in Make |
| `sentAt` | string | ISO 8601 timestamp of the send event |

---

## Execution History

Every send is logged in the **Recent sends** panel: timestamp, block count, format, status (success / error). The last 10 executions are stored in `localStorage`.

This lets you audit what was sent without leaving flompt, and replay any previous send.

---

## Privacy

The entire integration runs **client-side**. The webhook URL and execution history are stored in `localStorage` under the key `flompt-make`. Nothing goes through flompt's servers — your browser makes the POST request directly to Make's webhook endpoint.

---

## Example Use Cases

**Content pipeline**
Build a blog post prompt in flompt → send to Make → Make runs it through Claude → stores the result in Notion → notifies your team in Slack.

**Customer support**
Build a response template in flompt with customer context blocks → send to Make → Make processes with AI → posts draft in Zendesk.

**Data enrichment**
Build a data analysis prompt in flompt with input variables → send to Make → Make runs it through GPT → writes results to Airtable or Google Sheets.

**Scheduled reports**
Make scenario runs on a schedule, injects live data into a flompt prompt via a preceding webhook, processes with AI, emails the report.

---

## Roadmap

- **Zapier integration** — same pattern, broader ecosystem
- **n8n support** — for self-hosted automation setups
- **Prompt variables** — inject dynamic values into blocks before sending
- **Per-project webhook URL** — each project remembers its own Make scenario

> This integration was contributed by [@Refaltor77](https://github.com/Refaltor77).
