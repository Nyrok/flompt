---
title: "Flompt + Make.com: Automate Your AI Workflows Without Code"
date: "2026-03-14"
excerpt: "Flompt can now send your assembled prompts directly to Make.com via webhook. Trigger any automation, Notion, Slack, Airtable, email, the moment your prompt is ready. A contribution by @Refaltor77."
tags: ["make.com", "automation", "workflow", "webhook", "community", "open-source"]
color: "primary"
---

## From Prompt to Workflow

Building a prompt is one thing. Using the output is another.

flompt's job ended at "Copy." You'd copy, paste, run it, manually route output.

Not anymore.

[**@Refaltor77**](https://github.com/Refaltor77) changed that.

## The Make.com Integration

**Send to Make.com** button sends your prompt to a webhook.

Make.com is automation with 2,000+ connectors. Route prompts anywhere: AI modules, databases, Slack, Notion, custom workflows.

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

Setup:

Make.com: Create scenario → Webhooks trigger → copy URL

flompt: Compile → Send to Make.com → paste URL → Test → Send

Make handles the rest: run through AI, route output.

## Real Use Cases

**Content pipeline**: Build a blog post prompt in flompt → send to Make → Make runs it through Claude → stores the result in Notion → notifies your team in Slack.

**Customer support automation**: Build a response template in flompt with customer context blocks → send to Make → Make processes with AI → posts draft response in Zendesk.

**Data enrichment**: Build a data analysis prompt in flompt with input variables → send to Make → Make runs it through GPT → writes results to Airtable.

**Weekly reports**: Schedule a Make scenario to pull data, inject it into a flompt prompt via webhook, process with AI, and email the report automatically.

## The History Panel

Every send is logged in the **Recent sends** history panel inside flompt. Timestamp, block count, format, and status (success/error). So you always know what was sent and when, without leaving the tool.

## No Backend, No Account

All local. Webhook URL in localStorage. No flompt server involvement. Your browser POSTs directly to Make.

Fast. Private. No infrastructure cost.

## Another @Refaltor77 Contribution

Second major feature from @Refaltor77 (after templates). Both reduce friction: from prompt to action.

Both available now at [flompt.dev](https://flompt.dev).

## What's Next

This is step one of a broader automation layer. Vision: flompt is the prompt front-end for any AI pipeline.

Roadmap:
- Zapier integration
- n8n support
- Prompt variables
- Scheduled sends

The foundation is solid. If you build something interesting with flompt + Make, share it with us on [GitHub](https://github.com/Nyrok/flompt).

---

[**Try it now →**](https://flompt.dev/app) · [**Make.com webhook docs**](https://www.make.com/en/help/tools/webhooks) · [**Star on GitHub**](https://github.com/Nyrok/flompt)
