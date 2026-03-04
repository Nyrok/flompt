# Block Types

flompt organizes prompts into **12 semantic block types**, each representing a distinct aspect of a well-structured AI prompt. The assembler applies Anthropic's Claude best practices automatically — blocks are ordered, wrapped in the right XML, and formatted for maximum accuracy.

---

## Document

Injects external reference content using Anthropic's XML grounding format. Claude is specifically trained to parse `<document>` tags, making it the most reliable way to provide source material.

**Assembled as:**
```xml
<documents>
  <document index="1">
    <source>Your document title</source>
    <document_content>
      [your content here]
    </document_content>
  </document>
</documents>
```

**When to use:** Whenever you want Claude to reason over a specific piece of text — an article, a code file, a dataset, a contract. Always placed first in the assembled prompt.

Color: green-light `#86efac`

---

## Role

Defines the AI persona or expertise. A well-crafted Role block significantly sharpens the tone, vocabulary, and reasoning style of the response.

**Examples:** `"You are an expert Python developer"`, `"Act as a senior product manager with 10 years in B2B SaaS"`

Color: violet `#c084fc`

---

## Audience

Specifies who the output is written for — their expertise level, role, background, or expectations. Distinct from Role (who the AI *is*), Audience defines who the AI is *speaking to*.

**Examples:** `"Software engineers familiar with REST APIs but new to async programming"`, `"Non-technical product managers who need to make a go/no-go decision"`

**Why it matters:** The same content, written for a junior developer vs. a CTO, will differ dramatically in vocabulary, depth, and framing. Making the audience explicit lets Claude calibrate automatically. This is the "A" in the COSTAR prompt framework.

Color: blue `#93c5fd`

---

## Context

Provides background information and situational context. This is the "why" behind the objective — it helps Claude understand the full picture before acting.

Color: slate `#94a3b8`

---

## Objective

Defines the main task to accomplish — what the AI should *do*. The core of your prompt — clear, actionable, specific.

**Examples:** `"Your goal is to review this code for bugs and style issues"`, `"Write a 500-word summary of the document above"`

Color: amber `#fbbf24`

---

## Goal

Defines the end goal and success criteria — *why* the task matters and what a good outcome looks like. Distinct from Objective (what to do), Goal explains what success means.

**Examples:** `"Help the reader decide in under 2 minutes whether to integrate this API. Prioritize clarity over completeness."`, `"The summary should be usable as a standalone executive brief — no prior knowledge assumed."`

**Why it matters:** When the task underspecifies what matters most, the AI has to guess. An explicit Goal lets Claude make the right trade-offs — length vs. depth, speed vs. accuracy, breadth vs. precision. This is the "G" in the RISEN prompt framework.

Color: emerald `#6ee7b7`

---

## Input

The actual data, variables, or content provided to the AI. Separating input from objective keeps prompts clean and reusable — swap the input without rewriting the whole prompt.

Color: green `#4ade80`

---

## Constraints

Rules, limitations, or guardrails for Claude. Be explicit — the more precise, the better.

**Examples:** `"Do not use bullet points"`, `"Never exceed 300 words"`, `"Only use information from the provided document"`

Color: rose `#fb7185`

---

## Examples

Few-shot demonstrations: input/output pairs that show Claude exactly what you expect. This is one of the most powerful techniques in prompt engineering.

Format your examples as:
```
Input: [your input here]
Output: [expected output here]
```

flompt automatically parses these pairs and wraps them in Claude's structured XML format:

**Assembled as:**
```xml
<examples>
  <example>
    <user_input>your input</user_input>
    <ideal_response>expected output</ideal_response>
  </example>
</examples>
```

**Why it matters:** Structured few-shot examples dramatically improve consistency and reduce ambiguity — Claude knows precisely what "good" looks like.

Color: violet-light `#c4b5fd`

---

## Chain of Thought

Explicit step-by-step reasoning instructions. Tells the AI *how* to think through the problem before answering — making implicit reasoning steps explicit and controllable.

**Examples:**
- `"Think step by step. First identify the root cause, then evaluate three possible solutions, then recommend the best one with a rationale."`
- `"Before answering, list the key assumptions you're making. Then reason through each one."`

**Assembled as:**
```xml
<thinking>
  Think step by step. First identify the root cause…
</thinking>
```

**Why it matters:** Chain of thought prompting reliably improves performance on complex reasoning tasks by forcing structured decomposition before committing to an answer. Research from Wei et al. (2022) shows it can significantly boost accuracy on math, logic, and multi-step tasks.

Color: amber-light `#fde68a`

---

## Output Format

Specifies the expected response structure — JSON, bullet list, table, numbered steps, prose, markdown, etc.

**Examples:** `"Respond with a JSON object containing 'title', 'summary', and 'tags' fields"`, `"Use markdown headers (##) for each section"`

Color: accent `#ff6b9d`

---

## Language

Specifies the language for Claude's response. Auto-detected on decomposition based on your prompt's language — always placed last in the assembled prompt.

Color: sky `#38bdf8`

---

## Block ordering

flompt automatically applies Anthropic's recommended block ordering:

```
documents → role → audience → context → objective → goal → input →
constraints → examples → chain_of_thought → output_format → language
```

This order is enforced regardless of how blocks are arranged on the canvas — the assembler sorts them optimally.

---

> **Tip:** Each block shows a color-coded header and an AI-generated 2-5 word summary — so your canvas stays readable even with many blocks.
