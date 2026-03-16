---
title: "Stop Fighting the Canvas: Flompt's New List View Builds Prompts Faster"
date: "2026-03-16"
excerpt: "Flompt now ships a list view as the default interface: no drag, no coordinates, just stacked cards you can edit, hide, reorder, and compile instantly. The canvas is still there when you want it."
tags: ["flompt", "list view", "ux", "prompt building", "release", "keyboard"]
color: "primary"
---

## The Canvas Is Powerful. It Is Also Overhead.

The canvas view in Flompt gives you a spatial overview of your prompt blocks. You can see how pieces relate, move them around, connect them visually. For complex prompts with many blocks and dependencies, it is genuinely useful.

But for most prompts, most of the time, you do not need spatial reasoning. You need to write, edit, and compile. The canvas introduces drag targets, zoom levels, and a coordinate system that gets in the way of just getting it done.

The new list view removes all of that.

## A Cleaner Default

The list view is now the default when you open Flompt. Blocks appear as stacked cards in a clean vertical layout. You can expand or collapse any card. You can edit content directly in the card's textarea. You can see a preview of the content when collapsed.

No canvas, no coordinates, no drag handles.

## One Toolbar, Everything You Need

A unified toolbar sits at the top of the list view with three sections.

On the left: the control actions. Clear all blocks, undo, redo, and a compile button that assembles your prompt and takes you directly to the output panel. No need to switch to canvas view to compile.

In the center: every block type as a one-click add button. Role, Context, Objective, Constraints, and more. Click once to add a block to the bottom of your list.

On the right: the view toggle. Switch between list view and canvas view at any time. Your blocks are the same in both views. Editing in list view is immediately reflected in canvas, and vice versa.

## Hide Blocks Without Deleting Them

Every block now has a visibility toggle: an eye icon on the left side of the card (and in the canvas block header).

Click it to hide a block. Hidden blocks stay in your workspace but are excluded from the assembled prompt. The card drops to 40% opacity so you know it is there but inactive.

This is useful when you are experimenting. You can build a block, test the prompt without it, and restore it later without rewriting anything.

## Keyboard-First Reordering

When a card is focused, four keyboard shortcuts control everything:

- `ArrowLeft` moves the block down one position
- `ArrowRight` moves it up one position
- `-` collapses the card
- `+` expands it

You can also use the chevron buttons on each card to move blocks up or down. The buttons disable automatically when a block is already at the top or bottom of the list.

## Duplicate Any Block

A copy button on each card creates an exact duplicate of the block, appended to the list with a fresh ID. Useful when you want to create a variation of an existing block or use it as a starting point for a new one.

## Two Views, One Dataset

Switching between list and canvas view is instant. Both views read from and write to the same store. There is no sync, no conversion, no delay.

If you build a prompt in list view and switch to canvas, every block is exactly where it should be. If you edit a block's content in canvas view and switch back to list, the change is already there.

The views are two interfaces to the same data.

[**Try it now**](https://flompt.dev/app) | [**Star on GitHub**](https://github.com/Nyrok/flompt)
