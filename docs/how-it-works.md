# How It Works

flompt follows a three-step loop: **Decompose → Edit → Assemble**.

---

## Step 1: Decompose

Paste any raw prompt into the input panel and click **Decompose into blocks**.

flompt sends your prompt to the backend (FastAPI), which uses Claude to analyze it and split it into semantic blocks. The decomposition runs **asynchronously** — you get a job ID immediately and flompt polls for the result in real time, showing you live queue position and status.

Each block is:

- Assigned a **type** from 12 possible categories
- Given a **2-5 word AI-generated summary** for quick identification on the canvas
- **Auto-positioned** with 180px vertical spacing
- **Auto-connected** top-to-bottom to represent reading order

A **Language block** is added automatically based on the detected language of your prompt.

```
User input: "You are a Python expert. Write a function that sorts a list of
dictionaries by a given key. Return only code, no explanations."

→ Role:        "You are a Python expert"
→ Objective:   "Write a function that sorts a list of dictionaries by a given key"
→ Constraints: "Return only code, no explanations"
→ Language:    English
```

> **No API key?** flompt falls back to a keyword-based heuristic decomposer — fully functional without any API configuration.

---

## Step 2: Edit Visually

Once on the canvas, you have full control:

| Action | How |
|---|---|
| **Reposition** a block | Drag it anywhere on the canvas |
| **Connect** two blocks | Click the bottom handle of one, then the top handle of another |
| **Edit content** | Click on any block — a textarea opens and auto-resizes |
| **Add a block** | Click a block type in the left sidebar |
| **Delete a block** | Click the × button or press `Delete` |
| **Undo / Redo** | `Ctrl+Z` / `Ctrl+Y` (last 30 states) |

The canvas uses a **20px snap-to-grid** and supports a minimap for large flows. Your session is **auto-saved** to localStorage — no data is lost on refresh.

---

## Step 3: Assemble

Click **Assemble prompt** in the output panel. Assembly is **100% local** — no API call, instant result.

### Block ordering algorithm

1. If edges (connections) exist → topological sort (Kahn's algorithm)
2. Otherwise → sort by `position.y` (top to bottom on canvas)
3. Within the same depth level → secondary sort by `TYPE_PRIORITY` (Anthropic's recommended ordering)

**Final ordering follows Anthropic's official best practices:**

```
documents → role → audience → context → objective → goal → input →
constraints → examples → chain_of_thought → output_format → language
```

### Output format — Claude-optimized XML

Blocks are wrapped in semantic XML tags matched to [Anthropic's prompt engineering guidelines](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices):

```xml
<documents>
  <document index="1">
    <source>Annual report</source>
    <document_content>
      [document text here]
    </document_content>
  </document>
</documents>

<role>Python expert</role>
<objective>Write a function that sorts a list of dictionaries by a given key</objective>
<constraints>Return only code, no explanations</constraints>

<examples>
  <example>
    <user_input>Input: [{"name": "Bob", "age": 30}]</user_input>
    <ideal_response>Output: sorted_list</ideal_response>
  </example>
</examples>

<thinking>
  Think step by step before answering.
</thinking>

<format_instructions>
  Be concise. No preamble. No filler phrases.
</format_instructions>

<language>English</language>
```

Special characters (`&`, `<`, `>`, `"`, `'`) are automatically escaped in block content.

### Export options

After assembling, you can:

- **Copy** to clipboard
- **Download as `.txt`**
- **Export as `.json`** — full session export (nodes, edges, assembled output)
- **Share** via native browser share API (if supported)
- **Send to AI** *(extension only)* — inject directly into the active AI chat

---

## Chrome Extension

The Chrome extension brings flompt directly into ChatGPT, Claude, and Gemini as a sidebar — no tab switching, no copy-paste.

→ [Full Chrome extension documentation](chrome-extension.md)

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected block |
| `Ctrl+A` | Select all blocks |
| `Escape` | Deselect / close panel |
