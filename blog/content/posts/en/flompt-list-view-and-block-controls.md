---
title: "Stop Fighting the Canvas: Flompt's New List View Builds Prompts Faster"
date: "2026-03-16"
excerpt: "Flompt now ships a list view as the default interface: no drag, no coordinates, just stacked cards you can edit, hide, reorder, and compile instantly. The canvas is still there when you want it."
tags: ["flompt", "list view", "ux", "prompt building", "release", "keyboard"]
color: "primary"
---

## The Canvas Is Powerful. It Is Also Overhead.

Canvas view is useful for complex prompts with many blocks.

But most prompts don't need spatial reasoning. You just need to write, edit, compile. Canvas adds friction.

List view removes it.

## A Cleaner Default

List view is the default. Blocks are stacked cards. Expand, collapse, edit. Preview when collapsed.

No canvas. No coordinates. No drag handles.

## One Toolbar, Everything You Need

One toolbar with three sections.

Left: Control actions (clear, undo, redo, compile).

Center: Block type buttons. Click to add.

Right: View toggle (list ↔ canvas). Changes sync instantly.

## Hide Blocks Without Deleting Them

Eye icon on each card toggles visibility.

Hidden blocks stay in workspace but are excluded from assembly. Card fades to 40% opacity.

Useful for testing without constraints or other blocks.

## Keyboard-First Reordering

Keyboard shortcuts (when focused):
- `ArrowLeft` = move down
- `ArrowRight` = move up
- `-` = collapse
- `+` = expand

Or use chevron buttons. Disable at top/bottom.

## Duplicate Any Block

Copy button duplicates the block with a fresh ID. Useful for variations.

## Two Views, One Dataset

Switch instantly between views. Both use the same data store. No sync, no conversion, no delay.

Build in list → switch to canvas → blocks are positioned. Edit in canvas → switch to list → changes are there.

Two interfaces, one data source.

[**Try it now**](https://flompt.dev/app) | [**Star on GitHub**](https://github.com/Nyrok/flompt)
