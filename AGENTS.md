# Agent Instructions: Pixel Vibe Portfolio

## Architecture & Tech Stack

- Frontend: React 18+ with TypeScript (Strict mode, avoid `any`)
- Styling: Tailwind CSS (with pixel-art aesthetic variables / fonts)
- Components: shadcn/ui patterns, modular single-responsibility components
- State/Game Loops: Custom React hooks (`useGameLoop`, `usePlayerPosition`, etc.) or Canvas 2D / RAF

## Rules & Constraints

1. **No Regressions**: Never delete existing interactive pixel mechanics when adding portfolio sections.
2. **Performance**: Keep rendering optimized (use `requestAnimationFrame` for game canvas loops, avoid re-rendering entire screens on frame ticks).
3. **Asset Handling**: All audio, sprites, and pixel tiles should live in `/public` or `/src/assets`.
4. **Git Hygiene**: Propose self-contained, reviewable changes before large refactors.
