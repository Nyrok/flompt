---
title: "Why We Removed the Prompt Guard"
date: "2026-03-04"
excerpt: "We shipped Llama Guard to filter unsafe prompts. Then we watched it silently kill conversion. Here's why we ripped it out."
tags: ["transparency", "product", "ux", "open source"]
---

When we first launched Flompt's decompose feature (where you paste a prompt and the AI breaks it into structured blocks), we added a security layer called Prompt Guard.

The idea was reasonable: run every prompt through Llama Guard 4 (via Groq) before sending it to the LLM. Detect harmful content. Reject anything flagged as unsafe.

We shipped it. We watched it. Then we removed it entirely.

Here's why.

---

## What Prompt Guard was supposed to do

Llama Guard is a Meta model trained on a hazard taxonomy (S1–S13: violent crimes, hate speech, sexual content, etc.). Given a prompt, it returns a safety verdict: `safe` or `unsafe`, with a list of violated categories.

In theory: clean. Before the real inference runs, screen the input. Block anything suspicious.

In practice: it was the wrong tool for this use case.

---

## Problem 1: Too many false positives

Prompt engineers work with unusual inputs by definition. They write prompts *about* violence for fiction. They simulate dangerous personas to test AI guardrails. They craft adversarial examples to study model behavior. They produce content for cybersecurity research, legal contexts, medical documentation.

Llama Guard was trained on a wide hazard taxonomy, which means it flags wide. A prompt about *writing* a thriller scene with conflict got blocked. A prompt testing jailbreak resilience got blocked. A prompt for a medical chatbot that mentioned "overdose thresholds" got blocked.

These aren't edge cases for prompt engineers. These are core use cases.

Every false positive was a silent failure. The user pasted a legitimate prompt, hit decompose, and got an error message saying their content was "unsafe." No explanation. No appeal. Just a wall.

---

## Problem 2: UX waste

Beyond the false positives, the guard added a phase to the flow.

Before: paste prompt → decompose → done.

After: paste prompt → *analyzing…* → decompose → done.

That `analyzing` phase was a mandatory wait: Groq inference on a 12B model, running before the actual work started. On a good day, it added roughly one second. On a bad day (cold start, rate limit, network latency), three to five.

This might sound small. It isn't. **The "analyzing" spinner was the first feedback the user saw.** Before the decomposition had even started, we were already telling them: *wait, we're inspecting your prompt.*

That's a bad first impression. It signals distrust. It adds friction at the exact moment when the user is evaluating whether this tool is fast and responsive.

---

## Problem 3: Conversion barrier

This is the blunt one.

Free tools live and die on the first few seconds of the user experience. The path from "I'll try this" to "I'm staying" is short. Any friction in that window, especially anything that looks like a rejection, pushes people out.

We were literally rejecting users on their first decompose attempt.

Not because their prompts were malicious. Because a general-purpose safety model, tuned for broad hazard detection, over-triggered on specialized content. And when someone's first interaction with your product is a blocked error, they don't try again with a different prompt. They close the tab.

---

## Why we kept it disabled before removing it

`PROMPT_GUARD_ENABLED=false` lived in our `.env` for weeks before we finally deleted the code.

Partly inertia. Partly the feeling that we might need it "later." Partly the assumption that the problem was calibration. Maybe with a different model, different thresholds, a different setup, it would work.

But the more we looked at it, the more we realized: **Prompt Guard was solving a problem we don't actually have.**

Flompt is a free, open-source tool. There's no accounts system. No generated content goes anywhere. The AI's response is displayed in the user's own chat interface, on the user's own screen, using the user's own API or browser session. We're not a content platform. We're not hosting or amplifying anything.

Running a safety filter over inputs to a prompt-building tool is cargo-cult security: the appearance of protection without meaningful risk reduction.

---

## What replaced it

Nothing, and that's the point.

The backend now goes directly from `queued` → `processing` → `done`. No analyzing step. No blocked state. No false positives.

If moderation ever becomes genuinely necessary (for a specific use case, at scale, with the right calibration), it belongs at the application layer, not as a blanket filter on every prompt decomposition request.

Until then: we trust our users to know what they're building.

---

*The full change is [open source](https://github.com/Nyrok/flompt) and documented in the commit history.*
