---
title: "flompt is now a native Claude Code tool"
date: "2026-02-26"
excerpt: "flompt ships a built-in MCP server. Add one line to your project config and decompose_prompt, compile_prompt become tools Claude Code can call directly. No install, no account."
tags: ["claude code", "MCP", "developer tools", "integration"]
---

## The Problem with Prompts in Agentic Workflows

When you're building with Claude Code, the hard part isn't the code. It's the prompt that drives each task. Writing a solid system prompt, a precise task description, a well-scoped set of constraints. That's where most of the quality comes from.

Until now, there was no structured way to do this inside an agentic workflow. You'd write the prompt in a text file, iterate manually, and hope it held up.

flompt changes that.

## What MCP Makes Possible

The Model Context Protocol (MCP) lets you expose custom tools to Claude Code. Any server that implements the protocol becomes a first-class tool in your agent's toolbox.

flompt now ships a hosted MCP server at `https://flompt.dev/mcp/`. Add it to your project and Claude Code gains three new tools:

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

Say you're building a Claude Code task that generates documentation. Instead of hardcoding a prompt string, your agent can:

1. Call `list_block_types` to understand what's available
2. Call `decompose_prompt` on an existing prompt to extract its structure
3. Adjust the blocks programmatically (swap the objective, add a constraint)
4. Call `compile_prompt` to produce the final optimized XML

The output is the same structured, Claude-optimized XML that the flompt web app produces: canonically ordered, properly tagged, instantly usable.

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

Modern LLMs parse XML tags as semantic delimiters. The model knows exactly where the role ends, where the constraints start. Less ambiguity, better isolation between sections, more consistent outputs.

Anthropic's own prompt engineering guidelines recommend this format for Claude. Flompt just makes it automatic.

## Stateless by Design

The MCP server is fully stateless. Each call to `decompose_prompt` or `compile_prompt` is independent: no session, no stored state, no side effects. Safe to call from any agent, any workflow, any number of times.

---

[**Read the integration guide →**](/docs/claude-code) · [Try the web app](https://flompt.dev/app)
