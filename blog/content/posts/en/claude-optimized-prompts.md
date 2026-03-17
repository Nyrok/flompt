---
title: "How to write Claude-optimized prompts: XML, documents, and structured examples"
date: "2026-02-25"
excerpt: "Anthropic's official best practices, translated into concrete techniques you can use today, and how flompt applies them automatically."
tags: ["Claude", "prompt engineering", "XML", "Anthropic", "best practices"]
color: "primary"
---

## Claude is different. Your prompts should be too.

Claude isn't like ChatGPT or Gemini. It has specific behaviors and strengths that make structured prompts much more effective.

Anthropic released official guidance on this. Here's what works best.

---

## 1. Document grounding with `<document>` XML

When Claude needs to read content (an article, code, a contract), don't paste it inline. Use Anthropic's document XML format:

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

This tells Claude: "This is a reference, not an instruction." Claude processes it more accurately and with fewer risks.

Anthropic reports up to **30% accuracy gains** versus plain-text.

**In flompt:** The **Document** block handles this automatically. Add your content, and the assembler wraps it in the correct XML format, indexed, sourced, and ready for Claude.

---

## 2. Structured few-shot examples

Few-shot examples are powerful. Format matters most.

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

This format is clear. Claude knows where each example starts and ends. No mix-up.

**In flompt:** Write your examples as `Input: [...]\nOutput: [...]` pairs in the **Examples** block. The assembler parses them and generates the proper XML automatically.

---

## 3. Block ordering matters

Order matters. Anthropic's research shows the best order is:

1. **Documents** (grounding first, always)
2. **Role** (persona)
3. **Audience** (who reads the output)
4. **Context** (background)
5. **Objective** (the main task, what to do)
6. **Goal** (end goal and success criteria)
7. **Input** (data to process)
8. **Constraints** (rules)
9. **Examples** (few-shot)
10. **Chain of Thought** (reasoning instructions)
11. **Output format** (response structure)
12. **Language** (last)

Why: Claude reads top-to-bottom. Documents first ground context. Instructions at the end stick.

**In flompt:** This ordering is automatic. No matter how you arrange blocks on the canvas, the assembler sorts them optimally before generating your prompt.

---

## 4. Use Response Style for formatting directives

The **Response Style** block handles all Claude-specific style directives: verbosity, tone, prose format, markdown, LaTeX. It's a structured UI, so no need to manually write formatting instructions.

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
  <audience>
    Mid-level engineers who will triage and fix the issues
  </audience>
  <objective>
    Review the provided code for bugs, performance issues, and style violations
  </objective>
  <goal>
    Help the team prioritize what to fix first. Surface critical issues clearly so the reviewer can act in under 5 minutes.
  </goal>
  <constraints>
    Focus on critical issues. Ignore cosmetic formatting.
  </constraints>
  <examples>
    <example>
      <user_input>def foo(x): return x*2</user_input>
      <ideal_response>No issues found. Simple, correct, readable.</ideal_response>
    </example>
  </examples>
  <thinking>
    Think step by step. First identify the issue type, then assess severity, then suggest a fix.
  </thinking>
  <output_format>
    Numbered list. One issue per line. Severity: [critical/warning/info].
  </output_format>
  <language>English</language>
</prompt>
```

You can build this entire structure in flompt, visually block by block, and assemble it in one click. No manual XML writing required.

---

## Start building

flompt applies all of these best practices automatically. Add your blocks, assemble, and get a Claude-optimized prompt ready to paste directly into any Claude interface or API call.

[Open flompt →](/app)
