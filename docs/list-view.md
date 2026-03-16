# List View

The List View is an alternative editing mode that displays all blocks as stacked cards in reading order. It is designed for focused content editing, reordering, and managing visibility — without needing to navigate a canvas.

Switch between views using the **List / Canvas toggle** in the top-right of the toolbar.

---

## Toolbar

The toolbar runs horizontally across the top and is divided into three zones:

| Zone | Contents |
|---|---|
| **Left** | Clear, Undo, Redo, Assemble prompt (Play icon) |
| **Center** | Add-block pills — one per block type |
| **Right** | View switcher: List / Canvas |

Clicking a pill in the center adds a new block of that type to the bottom of the list. The **Assemble prompt** button works identically to the one in the output panel — same ordering algorithm, same XML output.

---

## Block Cards

Each block is displayed as a card with two sections: a **header** and an optional **content area**.

### Header

| Element | Position | Action |
|---|---|---|
| Eye / EyeOff icon | Far left | Toggle hide/show for this block |
| Block type label + AI summary | Center | Identifies the block |
| `−` / `+` button | Right | Collapse or expand the content area |

### Content area (expanded)

When a card is expanded, a **textarea** displays the block's full content. It is directly editable — changes are saved to the store immediately.

### Action buttons

Each card footer includes the following actions:

| Button | Action |
|---|---|
| ↑ (ChevronUp) | Move the block one position up. Disabled when the block is first in the list. |
| ↓ (ChevronDown) | Move the block one position down. Disabled when the block is last in the list. |
| Copy (Duplicate) | Creates a copy of the block inserted immediately after the original. The copy is always visible (`hidden: false`). |
| Delete | Removes the block permanently. |

---

## Hide / Show

Each block has an **Eye / EyeOff toggle** in the card header (also available on canvas nodes).

- **Hidden blocks are excluded from prompt assembly** — they are skipped entirely when you click Assemble.
- In List View, hidden cards are rendered at **0.4 opacity** to make their status visually obvious while keeping them in context.
- In Canvas View, hidden nodes are rendered at **0.35 opacity** and receive the CSS class `block-node--hidden`.
- The hidden state is persisted in the Zustand store and saved with the project.

---

## Reorder

Use the **↑ / ↓ buttons** in the card footer to move a block up or down in the list.

- The ↑ button is disabled for the first block in the list.
- The ↓ button is disabled for the last block in the list.
- Reordering in List View updates the same underlying block order used by the Assemble step when no canvas edges are present.

---

## Duplicate

Click the **Copy button** on a card to duplicate a block.

- The duplicate is inserted immediately after the original.
- It is always created with `hidden: false`, regardless of the source block's state.
- All content is copied as-is.

---

## Differences from Canvas View

| Feature | List View | Canvas View |
|---|---|---|
| Layout | Linear, top-to-bottom | Free-form, draggable |
| Add blocks | Pills in toolbar center | Pills in toolbar center |
| Edit content | Inline textarea (expand card) | Click block on canvas |
| Reorder | ↑/↓ buttons | Drag + edge connections |
| Connect blocks | Not available | Edge handles |
| Duplicate | Copy button on card | Not available |
| Hide/Show | Eye icon on card header | Eye icon on node header |
| Hidden opacity | 0.4 | 0.35 |
| Minimap | No | Yes |
| Snap-to-grid | No | 20px grid |
