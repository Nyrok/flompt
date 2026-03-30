---
title: "Flompt Projects: Multiple Workspaces, Zero Data Retention"
date: "2026-03-14"
excerpt: "Flompt now supports multiple independent project workspaces, each with its own canvas, prompt, and output. Switch between them instantly, export and import as JSON, and keep everything local. Your data never leaves your browser."
tags: ["projects", "privacy", "workflow", "local-first", "open-source"]
color: "primary"
---

## The Problem with a Single Canvas

flompt had one canvas. Works for one prompt.

Most people build multiple: code review, content pipeline, support templates, onboarding.

You'd either keep one messy canvas or clear it and lose work.

Projects fix this.

## What Projects Are

A project is an isolated workspace: canvas, compiled output, settings.

Independent. Switching projects replaces canvas state instantly.

Manage from a pill selector in the header. Click to switch, rename, or delete.

## Auto-Save, Always

Auto-save on every change: add block, edit, move node.

Debounced at 1 second. Pause = saved. Close tab = work persists.

Same on project switch: current state commits before switching.

## The Default Project

A Default project is created automatically. Protected, can't be deleted.

If you used flompt before: your work migrates here.

## Import / Export: Portability Without a Cloud

Export/import projects as JSON. Why it matters:

**Backing up your work**: Export a project before a major restructure. If the new direction doesn't work, import the backup. Version control for your prompts, no Git required.

**Sharing prompt flows with a team**: Export your best-performing code review project, send the JSON to a colleague. They import it into their own flompt instance in seconds. No account, no shared cloud workspace, no permissions to configure.

**Moving between machines**: Export from your work computer, import on your personal laptop. Your entire prompt workspace travels as a single file.

**Onboarding new collaborators**: Build a reference project with your team's standard prompt structures. Export it as a template. Every new team member imports it and starts from a consistent baseline.

JSON is readable. Inspect it, diff it, store in a repo.

## No Data Retention. Ever.

Local-first. Everything in browser localStorage. No account, no server.

Prompts often have sensitive info. On flompt, it stays on your machine.

Export JSON stays where you put it. You control everything.

## A Concrete Use Case

Example team setup:

1. "Weekly update" - status, blockers, next steps. Send to Make → Claude → Notion.

2. "Code review" - analysis template for PRs.

3. "Customer response" - support template. Export for reps.

4. "Competitor analysis" - quarterly strategy. Share JSON with leadership.

Four workspaces. One tool. No cloud.

## What's Next

Foundation for a larger vision: flompt as a personal prompt OS.

Pieces: canvas, templates, Make.com, projects.

Roadmap:
- Project tags and search
- Project-level settings
- Shared project links
- Prompt version history

If you have ideas, feedback, or want to contribute, the repository is open: [**github.com/Nyrok/flompt**](https://github.com/Nyrok/flompt).

---

[**Open flompt →**](https://flompt.dev/app) · [**Star on GitHub**](https://github.com/Nyrok/flompt) · [**Install the extension**](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc)
