---
title: "Flompt + Make.com: Automate Your AI Workflows Without Code"
date: "2026-03-14"
excerpt: "Flompt can now send your assembled prompts directly to Make.com via webhook. Trigger any automation — Notion, Slack, Airtable, email — the moment your prompt is ready. A contribution by @Refaltor77."
tags: ["make.com", "automation", "workflow", "webhook", "community", "open-source"]
---

## From Prompt to Workflow

Building a great AI prompt is one thing. Doing something useful with the output is another.

Until now, flompt's job ended at the "Copy" button. You assembled your structured prompt, copied it, pasted it into ChatGPT or Claude, got a response, and then manually routed that output wherever it needed to go — a Notion doc, a Slack message, an Airtable row, a Google Sheet.

[**@Refaltor77**](https://github.com/Refaltor77) changed that.

## The Make.com Integration

The new **Send to Make.com** button in flompt's output panel lets you fire your assembled prompt directly to a Make.com webhook with a single click.

Make.com (formerly Integromat) is a visual automation platform with 2,000+ app connectors. When flompt sends a prompt to your webhook, Make can route it anywhere: run it through an AI module, store the result in a database, send a Slack notification, create a Notion page, or trigger any multi-step workflow you've built.

**What flompt sends to Make:**

```json
{
  "prompt": "<your assembled XML prompt>",
  "format": "claude",
  "blockCount": 6,
  "source": "flompt",
  "sentAt": "2026-03-13T10:42:00.000Z"
}
```

That's it. No auth, no API keys, no setup beyond pasting your webhook URL once.

## How to Set It Up

**In Make.com:**
1. Create a new scenario
2. Add a **Webhooks → Custom webhook** trigger
3. Copy the webhook URL Make gives you

**In flompt:**
1. Assemble your prompt (build your blocks, hit Compile)
2. Click **Send to Make.com** in the output panel
3. Paste your webhook URL — flompt validates and saves it
4. Hit **Test** to verify the connection
5. Click **Send** — your prompt lands in Make instantly

From there, your Make scenario takes over. Connect it to Claude AI, ChatGPT, or any LLM module in Make, process the response, and route it wherever you need.

## Real Use Cases

**Content pipeline** — Build a blog post prompt in flompt → send to Make → Make runs it through Claude → stores the result in Notion → notifies your team in Slack.

**Customer support automation** — Build a response template in flompt with customer context blocks → send to Make → Make processes with AI → posts draft response in Zendesk.

**Data enrichment** — Build a data analysis prompt in flompt with input variables → send to Make → Make runs it through GPT → writes results to Airtable.

**Weekly reports** — Schedule a Make scenario to pull data, inject it into a flompt prompt via webhook, process with AI, and email the report automatically.

## The History Panel

Every send is logged in the **Recent sends** history panel inside flompt. Timestamp, block count, format, and status (success/error). So you always know what was sent and when, without leaving the tool.

## No Backend, No Account

The entire integration is local. The webhook URL is saved to `localStorage` — nothing goes through flompt's servers. When you click Send, your browser makes the POST request directly to Make's webhook endpoint. Fast, private, and zero infrastructure on our end.

## Another @Refaltor77 Contribution

This is the second major feature @Refaltor77 has shipped for flompt in a short span — following the [100+ template library](/blog/en/template-library) he contributed earlier. Both features follow the same philosophy: reduce friction between building a good prompt and doing something useful with it.

The Make integration ships alongside the template library as part of the same pull request batch, and both are available now at [flompt.dev](https://flompt.dev).

## What's Next

The Make.com integration is the first step toward a broader **automation layer** for flompt. The vision: flompt becomes the prompt-building front-end for any AI pipeline, whether that's Make, Zapier, n8n, or a custom backend.

Next up on the roadmap:
- **Zapier integration** — same pattern, broader ecosystem
- **n8n support** — for self-hosted automation setups
- **Prompt variables** — inject dynamic values into blocks before sending
- **Scheduled sends** — trigger flompt → Make pipelines on a schedule directly from the app

The foundation is solid. If you build something interesting with flompt + Make, share it with us on [GitHub](https://github.com/Nyrok/flompt).

---

[**Try it now →**](https://flompt.dev/app) · [**Make.com webhook docs**](https://www.make.com/en/help/tools/webhooks) · [**Star on GitHub**](https://github.com/Nyrok/flompt)
