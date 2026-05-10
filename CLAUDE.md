# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A web GUI tool for managing Claude Code's `~/.claude/settings.json`. It allows configuring multiple LLM providers and switching between them with one click. The tool merges a provider's `env` (API URL, token, model) with common config (plugins, hooks, statusLine, etc.) and previews the resulting settings.json in a Monaco editor before saving.

## Commands

```bash
npm run dev          # Start backend (:3456) + frontend (:5173) in parallel
npm run dev:server   # Express backend only
npm run dev:client   # Vite dev server only (HMR, proxies /api → :3456)
npm run build        # TypeScript check + Vite production build
npm start            # Build client, then serve from Express on :3456
```

`npm install` in root for Express; `npm --prefix client install` for the React/Vite frontend.

## Architecture

**Data flow:**
1. Presets (`cc-switch-presets.json`) store an array of providers (each with `id`, `name`, `env`) and a `commonConfig` object.
2. Selecting a provider deep-merges its `env` onto `commonConfig.env` (common env as base, provider env wins on same keys), then shallow-merges non-env commonConfig keys.
3. The merged result is shown in a Monaco JSON editor — the user can further edit it.
4. Saving writes the result to the target `settings.json` path.

**Target paths:**
- Dev (`NODE_ENV != "production"`): `./settings.dev.json` (safe for testing)
- Production: `~/.claude/settings.json` (the real Claude Code config)

**Backend** (`server.js`): A thin Express server with 6 API routes under `/api`:
- `GET /api/config` — returns the target settings file path
- `GET /api/presets` — reads `cc-switch-presets.json`
- `PUT /api/presets` — writes `cc-switch-presets.json`
- `GET /api/settings` — reads the target settings.json
- `PUT /api/settings` — writes the target settings.json
- In production, also serves the built `client/dist/` as static files with SPA fallback

**Frontend** (`client/`): React 18 + TypeScript + Vite.
- `App.tsx` holds all state (presets, active provider, merged config, toast) and the merge logic.
- `api.ts` is a thin fetch wrapper for all `/api` calls.
- `types.ts` defines `Provider` and `Presets`.
- Components: `ProviderList` (sidebar list), `ProviderForm` (add/edit provider modal), `JsonEditor` (Monaco editor wrapper), `CommonConfigModal` (edit common config in a modal).

**The "merge common config" checkbox** in the toolbar controls whether `commonConfig` is included in the merge. Toggling it re-computes the merged result from the same active provider + common config.

## Key files

| File | Purpose |
|------|---------|
| `server.js` | Express API + static file serving |
| `cc-switch-presets.json` | Persisted providers + common config (gitignored, contains secrets) |
| `settings.dev.json` | Dev-mode write target (gitignored) |
| `client/src/App.tsx` | All state management, merge logic, layout |
| `client/src/api.ts` | API client layer |
| `client/vite.config.ts` | Vite config with `/api` proxy to `:3456` |
