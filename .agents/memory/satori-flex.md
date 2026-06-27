---
name: Satori flex requirement
description: Satori requires explicit display:flex on every element with multiple children — there is no block display default.
---

Every `<div>` (or any container element) in a satori JSX tree that has **more than one child node** must have `display: "flex"` explicitly set in its style. Satori does not support `display: block` — omitting it causes the runtime error: "Expected <div> to have explicit 'display: flex', 'display: contents', or 'display: none' if it has more than one child node."

**Why:** Satori is a subset CSS layout engine based on flexbox. It intentionally excludes block-flow layout to keep the renderer simple and predictable.

**How to apply:** When building any OG image template with satori, ensure every wrapping div has at minimum `style: { display: "flex", flexDirection: "column" }`. Single-child elements or pure text nodes don't need it, but it's safest to add it everywhere.
