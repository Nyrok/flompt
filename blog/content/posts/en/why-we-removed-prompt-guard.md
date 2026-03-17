---
title: "Why We Removed the Prompt Guard"
date: "2026-03-04"
excerpt: "We shipped Llama Guard to filter unsafe prompts. Then we watched it silently kill conversion. Here's why we ripped it out."
tags: ["transparency", "product", "ux", "open source"]
color: "primary"
---

We shipped Prompt Guard with decompose: filter every prompt through Llama Guard 4.

We watched it. Then removed it.

Why.

---

## What Prompt Guard was supposed to do

Llama Guard detects hazards: violent crimes, hate speech, sexual content, etc. Returns: safe or unsafe.

Theory: screen before inference.

Practice: wrong tool.

---

## Problem 1: Too many false positives

Prompt engineers write about violence (fiction), simulate dangerous personas (testing), craft adversarial examples (research), work with medical/legal/security content.

Llama Guard flags wide. Thriller prompt: blocked. Jailbreak test: blocked. Medical chatbot: blocked.

False positives = silent failures. No explanation. Just "unsafe."

---

## Problem 2: UX waste

The guard added a phase: analyzing.

Before: paste → decompose.

After: paste → analyzing → decompose.

That wait: 1-5 seconds. On a good day, one second. On a bad day, five.

Small? No. The "analyzing" spinner was the first thing users saw. Before decompose started, we signaled: wait, we don't trust your prompt.

Bad first impression. Adds friction at the critical moment.

---

## Problem 3: Conversion barrier

The blunt one.

Free tools live on first seconds. Path from "I'll try" to "I'm staying" is short.

We rejected users on their first attempt.

Not malicious. But a general-purpose safety model over-triggered on specialized content.

First interaction = error? They close the tab.

---

## Why we kept it disabled before removing it

We disabled it (`PROMPT_GUARD_ENABLED=false`) but kept the code.

Inertia. "Maybe later." Different model, different thresholds?

Then realized: we don't have that problem.

flompt is free, open-source. No accounts. No content goes to our servers. Users own their data.

Filtering inputs is cargo-cult security: appearance without reduction.

---

## What replaced it

Nothing. That's the point.

Backend: queued → processing → done. No analyzing. No blocks. No false positives.

If moderation becomes necessary later: at the application layer, not blanket filtering.

For now: we trust users.

---

*The full change is [open source](https://github.com/Nyrok/flompt) and documented in the commit history.*
