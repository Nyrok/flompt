---
title: "How to write Claude-optimized prompts: XML, documents, and structured examples"
date: "2026-02-25"
excerpt: "Anthropic's official best practices, translated into concrete techniques you can use today — and how flompt applies them automatically."
tags: ["Claude", "prompt engineering", "XML", "Anthropic", "best practices"]
---

## Claude is different — and your prompts should be too

Most prompt engineering guides treat all LLMs the same. But Claude has specific behaviors, training patterns, and XML parsing capabilities that make well-structured prompts measurably more effective.

Anthropic has published detailed guidance on this. Here's what matters most — and how flompt applies it automatically.

---

## 1. Document grounding with `<document>` XML

When you need Claude to reason over external content — an article, a code file, a contract — the best way to provide it isn't to paste it inline. It's to use Anthropic's document XML format:

```xml
<documents>
  <document index="1">
    <source>Q4 Report</source>
    <document_content>
      [your content here]
    </document_content>
  </document>
</documents>
```

This structure tells Claude: *this is a reference document, not an instruction*. It processes it differently — more accurately, with better source attribution, and with less risk of instruction injection.

Anthropic reports up to **30% accuracy improvements** on document-grounded tasks compared to plain-text injection.

**In flompt:** The **Document** block handles this automatically. Add your content, and the assembler wraps it in the correct XML format — indexed, sourced, ready for Claude.

---

## 2. Structured few-shot examples

Few-shot examples are one of the most powerful prompting techniques. But the format matters more than most people realize.

Instead of:
```
Example: [input] → [output]
```

Use the structured XML format:
```xml
<examples>
  <example>
    <user_input>Analyze this code for bugs</user_input>
    <ideal_response>
      Found 2 issues:
      1. Off-by-one error on line 12
      2. Null pointer dereference on line 28
    </ideal_response>
  </example>
</examples>
```

This format is unambiguous — Claude knows exactly where the example starts and ends, what the input is, and what the ideal response looks like. No accidental bleed between examples.

**In flompt:** Write your examples as `Input: [...]\nOutput: [...]` pairs in the **Examples** block. The assembler parses them and generates the proper XML automatically.

---

## 3. Block ordering matters

Anthropic's research shows that the order of your prompt sections affects Claude's performance. The recommended order is:

1. **Documents** (grounding first — always)
2. **Role** (persona)
3. **Context** (background)
4. **Objective** (main task)
5. **Input** (data to process)
6. **Constraints** (rules)
7. **Examples** (few-shot)
8. **Output format** (response structure)
9. **Format control** (style directives)
10. **Language** (last)

The reasoning: Claude reads prompts top-to-bottom. Grounding documents first gives Claude the context it needs to correctly interpret everything that follows. Instructions at the end are harder to ignore and thus more reliably followed.

**In flompt:** This ordering is automatic. No matter how you arrange blocks on the canvas, the assembler sorts them optimally before generating your prompt.

---

## 4. Separate format from structure with Format Control

Most prompts mix "what to return" with "how to write it." That makes iteration harder — changing the tone forces you to rewrite the format definition too.

The **Format Control** block is dedicated to Claude-specific style directives:

```xml
<format_instructions>
  Be concise. No preamble. Use markdown headers.
  Maximum 3 paragraphs per section.
</format_instructions>
```

Keep output format (JSON schema, numbered list, table columns) in **Output Format**. Keep style (verbosity, tone, markdown on/off) in **Format Control**. Iterate them independently.

---

## The full assembled prompt

Here's what a well-structured prompt looks like when all best practices are applied:

```xml
<prompt>
  <documents>
    <document index="1">
      <source>User codebase</source>
      <document_content>
        [code here]
      </document_content>
    </document>
  </documents>
  <role>
    Senior Python developer specializing in code review
  </role>
  <objective>
    Review the provided code for bugs, performance issues, and style violations
  </objective>
  <constraints>
    Focus on critical issues. Ignore cosmetic formatting.
  </constraints>
  <examples>
    <example>
      <user_input>def foo(x): return x*2</user_input>
      <ideal_response>No issues found. Simple, correct, readable.</ideal_response>
    </example>
  </examples>
  <output_format>
    Numbered list. One issue per line. Severity: [critical/warning/info].
  </output_format>
  <format_instructions>
    Be concise. No preamble. Use code references (line numbers).
  </format_instructions>
  <language>English</language>
</prompt>
```

You can build this entire structure in flompt — visually, block by block — and assemble it in one click. No manual XML writing required.

---

## Start building

flompt applies all of these best practices automatically. Add your blocks, assemble, and get a Claude-optimized prompt — ready to paste directly into any Claude interface or API call.

[Open flompt →](/app)
