## Agent skills

This repository is the React frontend for `Economize`, an application for recording and controlling expenses.

- User-facing UI copy, labels, validation messages, and documentation for the product must use Brazilian Portuguese (`pt-BR`).
- Follow Brazilian conventions for displayed currency, dates, and numbers.

## Development

- Use `pnpm`; the repository is single-package and is pinned by `pnpm-lock.yaml`.
- Run `pnpm dev` to start the Vite development server with HMR.
- Run `pnpm lint` to run Oxlint.
- Run `pnpm build` for the required verification: it runs `tsc -b` and then `vite build`.
- Run `pnpm preview` only after `pnpm build` to serve the production build locally.
- There is currently no test script or test framework configured.

## Structure

- `src/main.tsx` is the browser entrypoint and renders `src/App.tsx`.
- `src/` contains the application code; `public/` contains static assets served from the site root.
- Vite is configured with the React Compiler through `@rolldown/plugin-babel`; do not disable or bypass that setup without a concrete reason.
- TypeScript checks both app and Vite config code with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `noFallthroughCasesInSwitch`.

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context domain documentation uses root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
