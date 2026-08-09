<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes

## Version ceilings — do not bump past these

- `typescript` stays on 6.x: typescript-eslint (bundled by eslint-config-next) caps at `<6.1.0`; TS 7 breaks the lint toolchain.
- `eslint` stays on 9.x: eslint-plugin-react does not support ESLint 10 yet.
- `@types/node` matches the Node runtime major (24, see Dockerfile).
- Before bumping any of these, re-check `npm view <pkg> peerDependencies` — the goal is zero warnings from `npm install`.

## Commands

- Verify changes with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- `next lint` was removed in Next 16 — the lint scripts use the ESLint CLI with the flat config in `eslint.config.mjs`.

## Conventions and gotchas

- Tailwind CSS v4 dropped `cursor: pointer` on buttons; the base-layer rule in `src/app/globals.css` restores it — keep it.
- Dark mode follows `prefers-color-scheme` via `dark:` variants. Use `neutral-*` instead of `gray-*` for filled dark surfaces (Tailwind's `gray` is blue-tinted).
- In `ResultTab`, fields/buttons without an `id` in the JSON config get deterministic fallback ids (`field-<index>`); the React key, the react-hook-form registration, and the `errors[...]` lookup must always use the same id.
- Tabs render conditionally, so `ResultTab` fully remounts on tab switch. A future "persist form data across tabs" feature must revisit the index-based fallback ids first.
