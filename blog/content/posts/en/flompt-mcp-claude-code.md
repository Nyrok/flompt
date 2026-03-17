---
title: "flompt is now a native Claude Code tool"
date: "2026-02-26"
excerpt: "flompt ships a built-in MCP server. Add one line to your project config and decompose_prompt, compile_prompt become tools Claude Code can call directly. No install, no account."
tags: ["claude code", "MCP", "developer tools", "integration"]
color: "primary"
---

## The Problem with Prompts in Agentic Workflows

Building with Claude Code is hard because of the prompt, not the code. System prompts, task descriptions, constraints. That's where quality comes from.

Until now: no structured way to do this. You'd write text, iterate manually, and hope.

flompt changes that.

## What MCP Makes Possible

MCP lets you expose custom tools to Claude Code. Any MCP server becomes a first-class tool.

flompt ships an MCP server at `https://flompt.dev/mcp/`. Add it and Claude Code gains three tools:

- **`decompose_prompt`**: takes any raw prompt and splits it into typed blocks (role, objective, constraints, output format…)
- **`compile_prompt`**: takes a list of blocks and returns a Claude-optimized XML prompt
- **`list_block_types`**: describes all 12 block types and the canonical ordering

No install. No API key. No account. The server is hosted and ready.

## Setup: One Command

**Via CLI:**

```bash
claude mcp add --transport http --scope user flompt https://flompt.dev/mcp/
```

**Or via `~/.claude.json`:**

```json
{
  "mcpServers": {
    "flompt": {
      "type": "http",
      "url": "https://flompt.dev/mcp/"
    }
  }
}
```

That's it. On the next session, `decompose_prompt`, `compile_prompt` and `list_block_types` are available.

## What This Looks Like in Practice

Building a documentation task? Your agent can:

1. Call `list_block_types` to see what's available
2. Call `decompose_prompt` to extract structure
3. Adjust blocks (swap objective, add constraint)
4. Call `compile_prompt` to produce XML

Output: same Claude-optimized XML as the web app.

## Why XML Still Matters

The compile output looks like this:

```xml
<prompt>
  <role>
    You are a senior technical writer specializing in developer documentation.
  </role>
  <objective>
    Write clear, concise API documentation for the endpoint described below.
  </objective>
  <constraints>
    Use present tense. No marketing language. Target audience: backend developers.
  </constraints>
  <output_format>
    Markdown. Include: description, parameters table, example request, example response.
  </output_format>
</prompt>
```

LLMs treat XML tags as semantic markers. Model knows where role ends, constraints start.

Less ambiguity. Better isolation. Consistent output.

Anthropic recommends it. flompt makes it automatic.

## Stateless by Design

Stateless server. Each call is independent. No session, no stored state. Safe to call anytime.

---

[**Read the integration guide →**](/docs/claude-code) · [Try the web app](https://flompt.dev/app)
