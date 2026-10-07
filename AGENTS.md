# Project notes

## Commands

- `npm run dev` starts the dev server.
- Verify changes with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Next 16 removed `next lint`; `npm run lint` runs the ESLint CLI with `eslint.config.mjs`.

## Structure

- `src/app` holds the App Router files. Each tab lives in `src/components/tabs/<TabName>/`, with a `components/` folder for its own parts.
- `src/schemas` holds the zod schemas of the JSON config, `src/context` the shared form state. The rest sits in `src/constants.ts`, `src/utils.ts` and `src/formActions.ts`.
- `@/` maps to `src/` — import as `@/components/...`, not with long relative paths.

## Form renderer

- The "user" in these notes is the person who writes a JSON config in the app.
- The JSON config copies HTML on purpose, so developers who know HTML learn nothing new. An item is a form element; its keys are that element's attributes, spelled as React spells them (`className`, `maxLength`).
- The schemas accept what HTML accepts. The few non-HTML keys (`label`, `options`, `text`, …) carry a `// custom:` comment.
- The renderer passes every key to React unchanged. `checked` and `value` pin the control; a user who wants an editable preset writes `defaultChecked` or `defaultValue`.
- Accessibility is the tool's job, not the user's: the renderer adds labels, error linkage and fallback ids. A user-set `id` or `aria-*` key always wins. The schema only requires an accessible name (`label`, `aria-label` or `aria-labelledby`).
- A new field type needs two edits: `formFieldTypes` in `src/schemas/formFieldSchema.ts` and a `case` in `ResultTab/components/FormField.tsx`. Without the `case` the form renders "Unknown field type".
- `on*` keys hold a handler _name_, never code. `withResolvedHandlers` (`src/formActions.ts`) resolves names listed in `formActionNames` and drops the rest; unlisted names are reserved for the generated code.
- Field `onChange` and `onBlur` are validated but never run: the field components spread `register()` last, so react-hook-form owns those events.
- The form sets `noValidate`, so `getValidationRules` (`src/utils.ts`) re-checks native validation attributes (`required`, `min`, `pattern`, …) the way the browser would. An attribute without a rule there, such as `step`, is never checked.
- A radio group's `options` are radio attribute objects (`radioOptionSchema`). Item keys reach every option and an option's own key wins. `aria-label` and `aria-labelledby` name the `fieldset`; `autoFocus` goes to the first option only. The group is required when the item or any option is `required`.
- A field without an `id` gets `field-<index>`, a radio option `<id>-<index>`. The React key, the react-hook-form registration, the `errors[...]` lookup and the schema's duplicate check must all use the same id. A button is keyed by its `id`, falling back to `button-<index>`.
- `formConfigSchema` rejects whitespace in an `id` and duplicates among field, radio option and `<id>-error` ids. Button ids and the app's own ids (`form-title`, `panel-result`, …) are not checked, by decision.
- Tabs render conditionally, so `ResultTab` remounts on every tab switch. Persisting form data across tabs would first need stable fallback ids.

## Dependencies

- `typescript` stays on 6.x: typescript-eslint (bundled by eslint-config-next) caps at `<6.1.0`.
- `eslint` stays on 9.x: eslint-plugin-react does not support ESLint 10 yet.
- `@types/node` matches the Node major in `Dockerfile` (24).
- Before bumping any of these, re-check `npm view <pkg> peerDependencies`. The goal is zero warnings from `npm install`.
- `.npmrc` sets `min-release-age=7` (npm 11.6+), so installs skip versions younger than 7 days. `npm ci` installs the lockfile as-is.
- Commit `package-lock.json` with every `package.json` change; the Docker build runs `npm ci` and fails if they disagree.

## Testing

- Jest with React Testing Library and jsdom. Tests sit next to their code as `<file>.test.ts(x)`.
- `jest.mocks.ts` patches the browser APIs jsdom lacks for CodeMirror (`matchMedia`, `Range.getClientRects`). Add global patches there, not in single test files.

## Conventions and gotchas

- Next 16 changed APIs — read `node_modules/next/dist/docs/` before writing Next-specific code.
- Run `npm run prettier` before committing.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`.
- Tailwind CSS v4 dropped `cursor: pointer` on buttons; a base-layer rule in `src/app/globals.css` restores it.
- `src/app/globals.css` sets the `sm` breakpoint to 400px (Tailwind's default is 640px). If you change it, update the `sizes` of the `Image` in `src/app/layout.tsx`.
- Never use deprecated Tailwind class names, such as `bg-gradient-to-*` (now `bg-linear-to-*`). Tailwind CSS v4 still accepts them, and only the Tailwind VS Code extension reports them.
- Dark mode follows `prefers-color-scheme` via `dark:` variants. Use `neutral-*`, not the blue-tinted `gray-*`, for filled dark surfaces.
