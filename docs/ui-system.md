# NEXUS-232 — UI & Design System Specification

## 1. Scientific Instrument Aesthetic

NEXUS-232 is designed to evoke the tactile precision and cold clarity of high-end scientific laboratory workstations.

Key visual attributes:
* **Dark cold base**: Deep void background (`#090c10`), charcoal technical surfaces (`#0e131b`).
* **Cyan/electric blue accent**: High-visibility precision accent (`#38bdf8`).
* **Subtle glowing borders**: Discreet 1px borders with luminescent hover states.
* **Compact technical typography**: Monospace font family (`JetBrains Mono`, `Fira Code`) across labels, equations, and code.
* **No extraneous ornamentation**: Zero RGB gaming aesthetic, zero heavy glassmorphism, zero distracting animated gradients.

---

## 2. CSS Custom Properties Tokens

All visual elements in NEXUS-232 inherit from CSS variables declared in `packages/ui/src/theme/tokens.css`:

```css
--nexus-bg
--nexus-surface
--nexus-surface-2
--nexus-border
--nexus-border-glow
--nexus-text
--nexus-text-muted
--nexus-accent
--nexus-valid
--nexus-in-review
--nexus-blocked
--nexus-radius
--nexus-spacing
--nexus-font-mono
--nexus-shadow
```

---

## 3. Resizable Panels & Layout System

The interface uses **Allotment** to support bidirectional resizing:
* **Top Bar**: Fixed 40px height with project switcher and view toggles.
* **Left Sidebar**: 56px fixed width navigation for high-level scientific views.
* **Horizontal Allotment Split**:
  - `ChatPanel` (min 220px, default 300px)
  - `TheoryCanvas` (min 300px, primary priority)
  - `InspectorPanel` (min 240px, default 320px)
* **Vertical Allotment Split**:
  - Upper: Canvas & sidebars
  - Lower Workspace: 4 tabs (`LaTeX`, `PDF Preview`, `Resources`, `3D Viewer`)
* **Status Bar**: Fixed 24px bottom bar showing active node count, compiler status, and sync health.
