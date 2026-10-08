# NEXUS-232 — Hard Architecture Specification & System Design

NEXUS-232 is a desktop scientific workspace designed for formulating hypotheses, representing theoretical derivations as a directed acyclic graph, attaching empirical evidence and resources, drafting LaTeX documents, compiling PDFs, and visualizing 3D models.

---

## 1. Monorepo Structure

```
NEXUS-232/
├── apps/
│   └── desktop/
│       ├── src/
│       │   ├── app/           (Store, context, index.css)
│       │   ├── shell/         (Top bar, sidebar, status bar, desktop bridge)
│       │   ├── layout/        (Allotment resizable splits, lower workspace)
│       │   ├── panels/        (Panel integrations)
│       │   ├── canvas/        (XYFlow theory canvas, custom nodes, toolbar)
│       │   ├── chat/          (Agent conversational interface, tool call cards)
│       │   ├── inspector/     (Node details, resources, relations, history)
│       │   ├── documents/     (Monaco LaTeX editor, PDF.js previewer)
│       │   ├── resources/     (Evidence library, anchor inspector)
│       │   ├── media/         (MediaAdapter, player controls, timestamp anchors)
│       │   ├── viewer3d/      (Three.js & @react-three/fiber vector viewer)
│       │   └── main.tsx       (React 19 entry point)
│       │
│       └── src-tauri/
│           ├── Cargo.toml     (Tauri 2.12 backend dependencies)
│           ├── build.rs       (Tauri build script)
│           ├── tauri.conf.json(Desktop window and capability configuration)
│           └── src/
│               ├── main.rs    (Windows desktop application entry point)
│               ├── lib.rs     (Tauri command registration & lifecycle)
│               ├── database/  (SQLite connection & schema migrations)
│               ├── latex/     (pdflatex/xelatex external compiler adapter)
│               ├── media/     (NativeLibMpvAdapter abstraction)
│               └── commands/  (Typed Tauri IPC commands)
│
├── packages/
│   ├── core/                  (Pure TypeScript domain models, zero external deps)
│   ├── application/           (Orchestration services & persistence interfaces)
│   ├── agent/                 (Provider abstractions, tool definitions & planner)
│   └── ui/                    (Tokens, themes, density, primitives & components)
│
├── tests/
│   ├── unit/                  (Core graph, theoretical compiler, agent tools)
│   └── integration/           (Complete vertical slice end-to-end test)
│
└── docs/                      (Architecture, domain, UI system & agent contract)
```

---

## 2. Decoupling Rules & Architectural Constraints

1. **Pure Core Domain**: `@nexus/core` imports **zero** external libraries. It contains no React, no Tauri, no Zustand, no XYFlow, and no AI vendor SDKs.
2. **Application Services as Mediators**: Components in `@nexus/desktop` never implement scientific calculations, SQLite queries, or direct AI calls. All actions pass through application services (`TheoryService`, `GraphService`, `DocumentService`, `ResourceService`, `CompilationService`, `AgentService`).
3. **Graph Projection**: `@xyflow/react` is purely a visual projection of the domain `TheoryGraph`. The domain is the single source of truth.
4. **Agent Tool Encapsulation**: The AI agent operates exclusively by issuing typed tool calls executed by the application layer.

---

## 3. Technology Stack

* **Desktop Runtime**: Tauri 2.12 with Rust backend.
* **Frontend**: React 19.3, TypeScript 7.0.2, Vite 8.3.4, pnpm workspaces.
* **Styling**: Tailwind CSS 4.3.3, CSS custom properties design tokens (`--nexus-*`).
* **Panels**: Allotment multi-split resizable panels.
* **Graph**: `@xyflow/react` 12.12.0 with custom scientific nodes.
* **State Management**: Zustand 5.0.15 (presentation/interaction state only).
* **Editors & Document**: Monaco Editor 0.55 / `@monaco-editor/react`, PDF.js.
* **3D**: Three.js + `@react-three/fiber`.
* **LaTeX Compilation**: MiKTeX / `pdflatex` native process execution.
* **Persistence**: SQLite with relational schema migrations.
