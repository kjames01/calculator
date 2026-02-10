# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server (Next.js on localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

Next.js 16 App Router calculator with TypeScript and Tailwind CSS.

All calculator logic lives in `components/Calculator.tsx` — a single `'use client'` component using a `useReducer` with typed discriminated-union actions (`INPUT_DIGIT`, `PERFORM_OPERATION`, `CALCULATE`, `APPLY_TRIG`, etc.). A memoized `Button` subcomponent renders the 5-column grid layout.

`app/page.tsx` is a server component that renders the Calculator; `app/layout.tsx` sets up Inter font and metadata.

Key details:
- Arithmetic operators are stored as Unicode characters (`×` and `÷`), not `*` and `/`
- Trig functions convert DEG/RAD before applying `Math.sin/cos/tan`, with a `< 1e-10` threshold to avoid floating-point display artifacts
- Keyboard handler (`useEffect` + `useCallback`) maps both regular and numpad keys to calculator actions; non-obvious shortcuts: `s`=sin, `c`=cos, `t`=tan, `d`=toggle DEG/RAD
- Division by zero produces `'Error'` display state, which most actions check before proceeding

Path alias `@/*` maps to the project root.
