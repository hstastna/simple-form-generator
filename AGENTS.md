# Project notes

## Commands

- `npm run dev` starts the dev server.
- Verify changes with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- `next lint` was removed in Next 16 — the lint scripts use the ESLint CLI with the flat config in `eslint.config.mjs`.

## Structure

- `src/app` holds the App Router files (`layout.tsx`, `page.tsx`, `globals.css`). Each tab lives in `src/components/tabs/<TabName>/`, with its own `components/` folder for parts used only by that tab.
- `src/schemas` holds the zod schemas that define the JSON config the app accepts; `src/context` holds shared form state, with the rest in `src/constants.ts`, `src/utils.ts` and `src/formActions.ts`.
- `@/` maps to `src/` (`tsconfig.json` and jest's `moduleNameMapper`) — import as `@/components/...` instead of long relative paths.
- A new field type needs two edits: add it to `formFieldTypes` in `src/schemas/formFieldSchema.ts`, and add a `case` for it in `ResultTab/components/FormField.tsx`. Without the second one the form renders "Unknown field type".
- The `on*` keys in the JSON hold a handler _name_, never code. `withResolvedHandlers` (`src/formActions.ts`) turns a name listed in `formActionNames` into the real function and drops any other name, so a string never reaches the DOM; unlisted names are reserved for the code the app will generate.
- Field `onChange` and `onBlur` are validated but never run: the field components spread `register()` last, so react-hook-form owns those two events.

## Dependencies

- `typescript` stays on 6.x: typescript-eslint (bundled by eslint-config-next) caps at `<6.1.0`; TS 7 breaks the lint toolchain.
- `eslint` stays on 9.x: eslint-plugin-react does not support ESLint 10 yet.
- `@types/node` matches the Node runtime major (24, see Dockerfile).
- Before bumping any of these, re-check `npm view <pkg> peerDependencies` — the goal is zero warnings from `npm install`.
- `.npmrc` sets `min-release-age=7` (needs npm 11.6+): installs only resolve versions published at least 7 days ago, so a brand-new release not being found is expected. `npm ci` is unaffected — it installs the lockfile as-is.
- Commit `package-lock.json` with every `package.json` change; the Docker build runs `npm ci` and fails if the two disagree.

## Testing

- Jest with React Testing Library and jsdom. Put tests in a `__tests__/` folder next to the code, or name the file `*.test.tsx`.
- `npm test` always writes a coverage report to `coverage/`.
- jsdom is missing browser APIs the CodeMirror editor needs; `jest.mocks.ts` patches `matchMedia` and `Range.getClientRects`. Add further global patches there, not in single test files.

## Conventions and gotchas

- Next 16 changed APIs and conventions — check the guides in `node_modules/next/dist/docs/` before writing Next-specific code.
- Formatting comes from `.prettierrc` (single quotes, semicolons, 80 columns, 2 spaces) — run `npm run prettier` before committing.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`.
- Tailwind CSS v4 dropped `cursor: pointer` on buttons; the base-layer rule in `src/app/globals.css` restores it — keep it.
- The `sm` breakpoint is overridden to 400px in `src/app/globals.css` (Tailwind's default is 640px). Tailwind is mobile-first, so `sm:` compiles to `min-width: 400px`. If you change it, update the `sizes` attribute of the `Image` in `src/app/layout.tsx` to match.
- Never use deprecated Tailwind class names. v4 keeps old ones as working aliases, and neither ESLint nor the build flags them — `bg-gradient-to-*` is now `bg-linear-to-*`. The Tailwind VS Code extension is the only thing that reports them.
- Dark mode follows `prefers-color-scheme` via `dark:` variants. Use `neutral-*` instead of `gray-*` for filled dark surfaces (Tailwind's `gray` is blue-tinted).
- In `ResultTab`, fields/buttons without an `id` in the JSON config get deterministic fallback ids (`field-<index>`); the React key, the react-hook-form registration, and the `errors[...]` lookup must always use the same id.
- Tabs render conditionally, so `ResultTab` fully remounts on tab switch. A future "persist form data across tabs" feature must revisit the index-based fallback ids first.
