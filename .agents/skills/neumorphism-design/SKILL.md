---
name: neumorphism-design
description: Design and implement accessible neumorphic (soft UI) interfaces for web applications. Use when creating or refining React components, HTML/CSS pages, dashboards, forms, cards, controls, design tokens, or component libraries that need subtle extruded and inset surfaces without sacrificing usability, contrast, responsiveness, or keyboard accessibility.
---

# Neumorphism Design

Create restrained, production-ready soft UI. Treat neumorphism as a surface treatment, not as
the only source of hierarchy or interaction feedback.

## Core Rules

1. Start from the existing product design system. Reuse its colors, spacing, typography,
   components, and interaction patterns before adding new tokens.
2. Use one dominant surface color for the page and raised controls. Create depth with paired
   light and dark shadows rather than unrelated background colors.
3. Apply neumorphism selectively to interactive controls, compact cards, segmented controls,
   media controls, toggles, and featured metrics.
4. Keep content-heavy containers, tables, long forms, alerts, and navigation structurally clear.
   Prefer borders, spacing, and conventional elevation when soft shadows reduce comprehension.
5. Never communicate state through shadows alone. Use labels, icons, color, position, or text in
   addition to elevation.
6. Preserve semantic HTML and native interaction behavior. Use `button`, `input`, `label`,
   `fieldset`, and landmark elements instead of simulated controls.

## Build The Visual System

### Choose A Surface

Use a neutral or lightly tinted base with enough room to generate both highlights and shadows.
Avoid pure white and pure black as the main surface.

Recommended starting points:

```css
:root {
  --neu-surface: #e7ecf3;
  --neu-surface-hover: #edf1f6;
  --neu-text: #202936;
  --neu-text-muted: #5f6b7a;
  --neu-accent: #356ae6;
  --neu-highlight: rgba(255, 255, 255, 0.82);
  --neu-shadow: rgba(113, 128, 150, 0.32);
  --neu-focus: #2457c5;
  --neu-danger: #c83b4d;
}

[data-theme="dark"] {
  --neu-surface: #252b35;
  --neu-surface-hover: #2b323d;
  --neu-text: #f2f5f8;
  --neu-text-muted: #b4bdc9;
  --neu-accent: #78a6ff;
  --neu-highlight: rgba(255, 255, 255, 0.07);
  --neu-shadow: rgba(0, 0, 0, 0.48);
  --neu-focus: #9bbcff;
  --neu-danger: #ff8290;
}
```

Adapt these values to the repository's existing tokens. Do not introduce a parallel token system
when equivalent variables already exist.

### Define Elevation Tokens

Use paired shadows with equal distance in opposite directions. Keep blur larger than offset.

```css
:root {
  --neu-raised-sm:
    -3px -3px 7px var(--neu-highlight),
    3px 3px 7px var(--neu-shadow);
  --neu-raised-md:
    -7px -7px 16px var(--neu-highlight),
    7px 7px 16px var(--neu-shadow);
  --neu-inset:
    inset 3px 3px 7px var(--neu-shadow),
    inset -3px -3px 7px var(--neu-highlight);
  --neu-radius-sm: 12px;
  --neu-radius-md: 18px;
  --neu-radius-lg: 28px;
}
```

Follow these limits:

- Use small elevation for frequently repeated controls.
- Use medium elevation for isolated cards or primary controls.
- Avoid stacking raised surfaces inside multiple raised containers.
- Keep shadow opacity subtle enough that text remains the strongest visual signal.
- Reduce blur and offset on small screens instead of scaling shadows up.

## Implement Component States

Make every interactive element visibly support these states:

- **Rest:** Show a restrained raised surface.
- **Hover:** Change color or shadow intensity slightly; do not move layout.
- **Pressed/selected:** Use an inset surface plus a persistent color, icon, or label change.
- **Focus-visible:** Show a high-contrast outline outside the shadow.
- **Disabled:** Reduce contrast and remove the raised affordance; keep text readable.
- **Loading:** Preserve dimensions and expose status to assistive technology.
- **Error/success:** Use text and an icon in addition to color.

Use this baseline button pattern:

```css
.neu-button {
  min-block-size: 44px;
  padding: 0.7rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--neu-radius-sm);
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  color: var(--neu-text);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease;
}

.neu-button:hover:not(:disabled) {
  background: var(--neu-surface-hover);
}

.neu-button:active:not(:disabled),
.neu-button[aria-pressed="true"] {
  box-shadow: var(--neu-inset);
  color: var(--neu-accent);
}

.neu-button:focus-visible {
  outline: 3px solid var(--neu-focus);
  outline-offset: 3px;
}

.neu-button:disabled {
  box-shadow: none;
  color: var(--neu-text-muted);
  cursor: not-allowed;
  opacity: 0.68;
}

@media (prefers-reduced-motion: reduce) {
  .neu-button {
    transition: none;
  }
}
```

## Handle Common Components

### Cards

- Use elevation on the outer card only.
- Create internal hierarchy with typography and spacing, not more shadows.
- Keep clickable cards semantic and give the entire target a clear focus ring.
- Use conventional separators when a card contains several unrelated actions.

### Inputs

- Pair an inset field with a persistent border or label.
- Keep labels visible; do not rely on placeholders as labels.
- Show focus with an outline or border color, not by removing the inset effect.
- Show validation messages adjacent to the field and connect them with `aria-describedby`.

```css
.neu-input {
  inline-size: 100%;
  min-block-size: 44px;
  border: 1px solid rgba(95, 107, 122, 0.28);
  border-radius: var(--neu-radius-sm);
  background: var(--neu-surface);
  box-shadow: var(--neu-inset);
  color: var(--neu-text);
  padding: 0.75rem 0.9rem;
}

.neu-input:focus-visible {
  border-color: var(--neu-focus);
  outline: 3px solid color-mix(in srgb, var(--neu-focus) 35%, transparent);
  outline-offset: 2px;
}
```

Provide a non-`color-mix()` fallback when the project's browser support requires it.

### Toggles And Segmented Controls

- Use a visible thumb or selected segment, not only an inset shadow.
- Preserve native checkbox/radio semantics or implement the full ARIA keyboard model.
- Make each target at least 44 by 44 CSS pixels where practical.
- Keep selected state legible in high-contrast and forced-colors modes.

### Icons

- Use the project's icon library rather than drawing new SVGs for standard actions.
- Pair ambiguous icons with labels or accessible names.
- Keep stroke weight consistent with typography and avoid decorative glow.

## Accessibility Gates

Before considering the design complete:

1. Meet WCAG contrast for text and meaningful icons. Do not count shadows as contrast.
2. Verify keyboard navigation, visible focus, logical tab order, and activation with Enter/Space.
3. Verify controls at 200% zoom and narrow mobile widths.
4. Test light mode, dark mode, high contrast, and `prefers-reduced-motion`.
5. Keep touch targets approximately 44 by 44 CSS pixels.
6. Ensure selected, pressed, invalid, and disabled states remain understandable without color.
7. Avoid placing critical controls on surfaces whose boundaries disappear in common displays.

Add a forced-colors fallback when custom shadows obscure boundaries:

```css
@media (forced-colors: active) {
  .neu-button,
  .neu-input,
  .neu-card {
    border: 1px solid CanvasText;
    box-shadow: none;
  }
}
```

## Responsive Rules

- Use spacing and layout changes before shrinking text or controls.
- Collapse multi-column cards to one column when content becomes cramped.
- Reduce shadow distance and blur below tablet widths.
- Avoid fixed heights for text-bearing components.
- Check that elevated surfaces do not clip inside scrolling containers.

## Framework Guidance

### React

- Keep visual variants in component props such as `variant`, `size`, and `pressed`.
- Forward native attributes and refs.
- Represent toggled state with `aria-pressed`, native inputs, or established accessible
  primitives.
- Avoid rerenders or animation libraries for effects CSS can handle.

### Tailwind

- Prefer theme extensions or CSS variables for repeated shadow recipes.
- Do not repeat long arbitrary `shadow-[...]` values throughout JSX.
- Define named utilities such as `shadow-neu-raised` and `shadow-neu-inset`.
- Keep focus and forced-colors utilities alongside the component styles.

### Existing Component Libraries

- Extend library components through supported theme APIs and class hooks.
- Preserve built-in semantics, keyboard behavior, loading states, and validation.
- Do not replace robust controls solely to achieve a shadow effect.

## Workflow

1. Inspect the repository's framework, styling method, tokens, component library, and existing
   patterns.
2. Identify the smallest set of components that benefit from neumorphic treatment.
3. Define or map surface, text, accent, radius, and shadow tokens.
4. Implement one representative component with all interaction states.
5. Reuse the validated pattern across related components.
6. Test accessibility and responsive behavior.
7. Run the repository's formatter, linter, type checks, and relevant tests.
8. Visually inspect the result in the browser when a local app is available.

## Quality Checklist

- Use no more than three elevation levels on one screen.
- Avoid shadow-only hierarchy and shadow-only interaction feedback.
- Keep typography crisp and conventional.
- Keep primary actions obvious without requiring users to infer depth.
- Maintain consistent light direction across every shadow.
- Avoid excessive pills, nested soft cards, gradients, and decorative glows.
- Prefer a restrained hybrid of flat design and neumorphism over a fully sculpted interface.
- Match existing project conventions and leave unrelated UI untouched.
