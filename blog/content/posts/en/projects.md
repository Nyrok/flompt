---
title: "Flompt Projects: Multiple Workspaces, Zero Data Retention"
date: "2026-03-14"
excerpt: "Flompt now supports multiple independent project workspaces, each with its own canvas, prompt, and output. Switch between them instantly, export and import as JSON, and keep everything local. Your data never leaves your browser."
tags: ["projects", "privacy", "workflow", "local-first", "open-source"]
color: "primary"
---

## The Problem with a Single Canvas

Until today, flompt had one canvas. One prompt. One state.

That works fine when you have one thing to build. But most people using flompt aren't building one prompt, they're building workflows for different contexts, different clients, different use cases. A code review flow. A content pipeline. A customer support template for a specific product. An onboarding sequence.

You had to either keep one monster canvas with everything on it, or clear the canvas and start over each time, losing whatever was there before. Neither option is great.

**Projects solves this.**

## What Projects Are

A **project** in flompt is a complete, isolated workspace. It stores:

- Your canvas (all blocks, positions, connections)
- The compiled prompt output
- The current format and language settings

Every project is independent. Switching projects replaces the entire canvas state, no mixup, no bleed between workspaces.

Projects are created, managed, and switched from a **pill selector in the header**, centered between the left and right panels. Click the selector, see all your projects, switch with one click. You can rename any project inline, delete the ones you no longer need, and create as many as your work requires.

## Auto-Save, Always

You don't save manually. flompt saves for you.

Every change to your canvas, adding a block, editing content, moving a node, triggers an auto-save, debounced at 1 second. By the time you pause typing, your work is already persisted. Close the tab, come back tomorrow: everything is exactly where you left it.

The same applies when you switch projects. Your current state is committed before the switch happens. Nothing is lost mid-workflow.

## The Default Project

When you open flompt for the first time, a **Default project** is created automatically. It's translated in your interface language and it's protected, it cannot be deleted. You always have a fallback workspace, no matter what.

The Default project is also where any previous canvas state migrates from the pre-project era. If you were already using flompt before this update, your work is still there.

## Import / Export: Portability Without a Cloud

Projects can be exported and imported as plain JSON files.

This is more powerful than it sounds. A few real scenarios:

**Backing up your work**: Export a project before a major restructure. If the new direction doesn't work, import the backup. Version control for your prompts, no Git required.

**Sharing prompt flows with a team**: Export your best-performing code review project, send the JSON to a colleague. They import it into their own flompt instance in seconds. No account, no shared cloud workspace, no permissions to configure.

**Moving between machines**: Export from your work computer, import on your personal laptop. Your entire prompt workspace travels as a single file.

**Onboarding new collaborators**: Build a reference project with your team's standard prompt structures. Export it as a template. Every new team member imports it and starts from a consistent baseline.

The JSON format is readable and stable. It's not an opaque blob, you can inspect it, diff it, and store it in a repository alongside your code if you want.

## No Data Retention. Ever.

flompt has always been local-first. Projects doesn't change that, it extends it.

Everything lives in your browser's `localStorage`. No account required. No server sees your prompts. No analytics on your content. Nothing is transmitted, stored, or processed on flompt's infrastructure.

This matters. Prompts often contain sensitive context, internal product details, customer information, proprietary processes, personal data. When you build a prompt in flompt, that content stays on your machine. The export JSON file stays wherever you put it. You're in full control.

We don't have data retention policies because we don't have your data. That's intentional, and it's not changing.

## A Concrete Use Case

Here's how a small product team might actually use Projects:

1. **"Weekly update"** project, a recurring prompt flow with blocks for team status, blockers, and next steps. Compiled every Monday, sent to Make.com, processed by Claude, pushed to Notion.

2. **"Code review"** project, a detailed code analysis template with role, constraints, and output format blocks. Used by the team's tech lead before every PR merge.

3. **"Customer response"** project, a support response template built around the product's tone of voice. Exported and imported by each support rep.

4. **"Competitor analysis"** project, a research prompt for quarterly strategy sessions. Shared as a JSON file across the leadership team.

Four independent workspaces. Four different purposes. One tool, no cloud.

## What's Next

Projects is the foundation for a larger vision: **flompt as a personal prompt operating system**.

The pieces are coming together, a canvas to build structured prompts, a template library to start from, Make.com to automate what happens next, and now projects to organize everything.

Next on the roadmap:
- **Project tags and search**: find any project instantly when you have dozens
- **Project-level settings**: default format, webhook URL, and language per project
- **Shared project links**: opt-in, ephemeral sharing without a backend
- **Prompt version history**: see how a prompt evolved within a project over time

If you have ideas, feedback, or want to contribute, the repository is open: [**github.com/Nyrok/flompt**](https://github.com/Nyrok/flompt).

---

[**Open flompt →**](https://flompt.dev/app) · [**Star on GitHub**](https://github.com/Nyrok/flompt) · [**Install the extension**](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc)
