# Views

Two editing modes: **Canvas** and **List**. Same data. Sync instantly. Switch anytime.

---

## Canvas View

Draggable nodes on infinite canvas.

**Layout:**
- Place blocks freely.
- 20px snap-to-grid alignment.
- Minimap (bottom-right) for overview.

**Add blocks:** Click type pill. Auto-spaced.

**Edit:** Click block. Inline textarea. Auto-resizes. Auto-saves.

### Connecting blocks

Drag from the **bottom handle** of one block to the **top handle** of another to create an edge. Edges define the reading order used during assembly (topological sort). Without edges, blocks are sorted by vertical position.

### Reordering

Drag blocks freely on the canvas, or connect them with edges to define explicit ordering.

### Actions

Each block node exposes the following controls:

| Control | Action |
|---|---|
| Eye / EyeOff icon | Toggle hide/show |
| `×` button | Delete the block |

### Undo / Redo

`Ctrl+Z` / `Ctrl+Y` — up to 30 states.

### Assemble

Click **Assemble prompt** in the right output panel. The assembled XML is computed locally and instantly.

---

## List View

An alternative editing mode that displays all blocks as stacked cards in reading order. Designed for focused content editing, reordering, and visibility management — no canvas navigation needed.

### Toolbar

The toolbar runs horizontally across the top and is divided into three zones:

| Zone | Contents |
|---|---|
| **Left** | Clear, Undo, Redo, Assemble prompt (Play icon) |
| **Center** | Add-block pills — one per block type |
| **Right** | View switcher: List / Canvas |

Clicking a pill in the center adds a new block of that type to the bottom of the list. The **Assemble prompt** button works identically to the one in the output panel — same ordering algorithm, same XML output.

### Block Cards

Each block is displayed as a card with two sections: a **header** and an optional **content area**.

#### Header

| Element | Position | Action |
|---|---|---|
| Eye / EyeOff icon | Far left | Toggle hide/show for this block |
| Block type label + AI summary | Center | Identifies the block |
| `−` / `+` button | Right | Collapse or expand the content area |

#### Content area (expanded)

When a card is expanded, a **textarea** displays the block's full content. It is directly editable — changes are saved to the store immediately and reflected in Canvas View.

#### Action buttons

| Button | Action |
|---|---|
| ↑ | Move the block one position up. Disabled when first in the list. |
| ↓ | Move the block one position down. Disabled when last in the list. |
| Copy | Duplicate the block, inserted immediately after. Always created with `hidden: false`. |
| Delete | Remove the block permanently. |

---

## Hide / Show

The Eye / EyeOff toggle is available on every block in **both views**.

- **Hidden blocks are excluded from prompt assembly** — skipped entirely when you click Assemble.
- In **List View**, hidden cards are rendered at **0.4 opacity**.
- In **Canvas View**, hidden nodes are rendered at **0.35 opacity** and receive the CSS class `block-node--hidden`.
- The hidden state is persisted in the Zustand store and saved with the project.

---

## Switching Views

Use the **List / Canvas toggle** in the top-right of the toolbar at any time. Both views always reflect the same state — no data is lost when switching.

---

## Comparison

| Feature | List View | Canvas View |
|---|---|---|
| Layout | Linear, top-to-bottom | Free-form, draggable |
| Add blocks | Pills in toolbar center | Pills in left sidebar |
| Edit content | Inline textarea (expand card) | Click block on canvas |
| Reorder | ↑/↓ buttons | Drag + edge connections |
| Connect blocks | Not available | Edge handles |
| Duplicate | Copy button on card | Not available |
| Hide/Show | Eye icon on card header | Eye icon on node header |
| Hidden opacity | 0.4 | 0.35 |
| Minimap | No | Yes |
| Snap-to-grid | No | 20px |
| Undo/Redo | ✅ | ✅ |
