> **Notice: Agentic Development Sandbox**
>
> This repository is a sandbox playground for experimenting with agentic development workflows. All application code in this project has been authored entirely by AI agents. No human has written, manually reviewed, or audited any of the code for correctness, security, or quality. Use or study this codebase with that context in mind.

---

# wörtl

Das deutsche Wordle – errate das Wort in sechs Versuchen.

A German-language clone of Wordle, built with Next.js and deployed as a static site on GitHub Pages.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/woertl](http://localhost:3000/woertl) to see the app.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the static site to `out/` |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Vitest |

## Project Structure

```
src/
  app/           – Next.js App Router pages and layouts
  components/    – Reusable UI components (TileGrid, Keyboard, Modal, etc.)
  lib/           – Pure game logic and utility functions
  hooks/         – Custom React hooks
  data/          – Static data files (German word lists)
  types/         – Shared TypeScript type definitions
  test/          – Global test setup
```

## Tech Stack

- **Next.js 16** with static export (`output: "export"`)
- **React 19** with TypeScript (strict mode)
- **CSS custom properties** for design tokens, CSS Modules for component styles
- **Vitest** + React Testing Library for testing
- **GitHub Actions** for CI/CD, **GitHub Pages** for hosting

See `wiki/architecture.md` and `wiki/coding-conventions.md` for more details.
