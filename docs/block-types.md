# Block Types

flompt organizes prompts into **11 semantic block types**, each representing a distinct aspect of a well-structured AI prompt. The assembler applies Anthropic's Claude best practices automatically — blocks are ordered, wrapped in the right XML, and formatted for maximum accuracy.

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

## Context

Provides background information and situational context. This is the "why" behind the objective — it helps Claude understand the full picture before acting.

Color: slate `#94a3b8`

---

## Objective

Defines the main goal or task. The core of your prompt — clear, actionable, specific.

**Examples:** `"Your goal is to review this code for bugs and style issues"`, `"Write a 500-word summary of the document above"`

Color: amber `#fbbf24`

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

## Output Format

Specifies the expected response structure — JSON, bullet list, table, numbered steps, prose, markdown, etc.

**Examples:** `"Respond with a JSON object containing 'title', 'summary', and 'tags' fields"`, `"Use markdown headers (##) for each section"`

Color: accent `#ff6b9d`

---

## Format Control

Claude-specific style and formatting directives. This block is separate from Output Format — it handles *how* Claude writes, not *what* it returns.

**Examples:**
- `"Be concise. No preamble. No filler phrases."`
- `"Use markdown. Keep responses under 3 paragraphs."`
- `"Write in a direct, professional tone. Avoid jargon."`

**Assembled as:**
```xml
<format_instructions>
  Be concise. Use markdown. No preamble.
</format_instructions>
```

**Why it matters:** Separating format control from output format makes prompts cleaner and easier to iterate. Change the style without touching the content structure.

Color: orange `#fdba74`

---

## Language

Specifies the language for Claude's response. Auto-detected on decomposition based on your prompt's language — always placed last in the assembled prompt.

Color: sky `#38bdf8`

---

## Block ordering

flompt automatically applies Anthropic's recommended block ordering:

```
documents → role → context → objective → input → constraints →
examples → output_format → format_control → language
```

This order is enforced regardless of how blocks are arranged on the canvas — the assembler sorts them optimally.

---

> **Tip:** Each block shows a color-coded header and an AI-generated 2-5 word summary — so your canvas stays readable even with many blocks.
