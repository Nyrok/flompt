---
title: "Beginner guide: writing your first effective prompt"
date: "2026-02-10"
excerpt: "You don't need to be an expert to write prompts that work. Here's a step-by-step guide to start on the right foot."
tags: ["beginner", "guide", "prompt engineering"]
---

## You don't need to be an expert

Prompt engineering looks intimidating from the outside. Technical terms, complex frameworks, examples that look like code. But the reality is simpler: a good prompt is a good instruction.

This guide will show you how to go from "it sometimes works" to "it works every time" in 4 steps.

## Step 1: Define what you want

It seems obvious, but it's the #1 cause of poor results. Before writing anything, answer these questions:

- **What's the deliverable?** (an email, code, an analysis, a summary...)
- **For whom?** (yourself, a client, a technical team...)
- **What format?** (paragraphs, list, table, JSON...)
- **What length?** (a tweet, a paragraph, a page...)

If you can't answer clearly, neither can the AI.

## Step 2: Provide context

AI has no context by default. It doesn't know who you are, what situation you're in, or why you're asking. Every relevant piece of information you add improves the result.

**Before:**
> Help me write a presentation.

**After:**
> I'm preparing a 10-minute presentation for investors. My product is a project management SaaS for SMBs. The audience isn't technical. I want to convince, not explain features.

The second prompt gives the AI everything it needs to be relevant.

## Step 3: Be specific about format

LLMs are highly sensitive to format instructions. Use this to your advantage:

```
Give me 5 slogans for a meditation app.
Format: one slogan per line, max 8 words each.
Tone: calm and inspiring, not mystical.
```

It's clear, measurable, and actionable. The AI knows exactly what to produce.

## Step 4: Iterate

Your first prompt probably won't be perfect, and that's normal. Iteration is part of the process:

1. Send your prompt
2. Read the response carefully
3. Identify what's missing or excessive
4. Add a clarification or constraint
5. Resend

Each iteration brings the result closer to what you want. After 2-3 rounds, you're usually there.

## The starter template

Here's a simple template you can use as a starting point for any prompt:

```
[CONTEXT]
I am [your role/situation]. I'm working on [project/task].

[OBJECTIVE]
I need [specific deliverable].

[CONSTRAINTS]
- Format: [desired format]
- Length: [length indication]
- Tone: [communication style]
- Avoid: [what you don't want]
```

This template covers 80% of use cases. Adapt it to your needs.

## Common mistakes to avoid

1. **Being too vague**: "Help me with my project" → The AI has nothing to work with
2. **Being too long**: A 2000-word prompt drowns the essentials → Stay concise
3. **Forgetting format**: Not specifying format = random output
4. **Not iterating**: Giving up after a first disappointing result

## What's next

Once you master these basics, you can explore advanced techniques:
- **Few-shot learning** (providing examples)
- **Chain-of-thought** (step-by-step reasoning)
- **Role prompting** (assigning an expert role)

But start with the 4 steps. They'll be enough for 80% of your AI interactions.
