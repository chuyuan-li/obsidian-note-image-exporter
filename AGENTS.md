# Image Share — Agent Guide

Guidance for AI agents working on this Obsidian plugin codebase.

## Build Commands

```bash
npm run dev           # esbuild watch mode with inline sourcemaps
npm run build         # tsc type-check then production esbuild (minified, no sourcemaps)
npm run typesafe-i18n # regenerate i18n type stubs after editing translations
```

No test runner is configured.

## Architecture

**Entry**: `main.ts` → re-exports `src/ExportImagePlugin.ts` (the Obsidian `Plugin` subclass)

**Export flows**:
- **Single file**: `exportImage.tsx` → renders markdown via Obsidian `MarkdownRenderer.render` → wraps in React `<Target>` component → captures via `html-to-image`
- **Split/pagination**: `capture.saveAll()` — renders full canvas once with `toCanvas()`, then crops per-page via `ctx.drawImage()`. PDF via jsPDF, images bundled into ZIP via JSZip
- **Folder batch**: `capture.saveMultipleFiles()` — 3-concurrent pool, each file gets independent temporary container + React root via `makeHTML()` → `saveAll()`

**Key pipeline**: `makeHTML.tsx` renders markdown into a detached div, creates a React `createRoot` in a container, mounts `<Target>` (which adds watermark, author info, metadata, padding), waits for `.export-image-root` via MutationObserver, returns `{ element, cleanup }`.

**React usage**: Only for export preview modals and the `<Target>` render component. Settings UI uses Obsidian's native `Setting` API (`SettingRenderer` + `formConfig.ts`).

**Form system (modal preview)**: `ModalContent.tsx` defines a `FormSchema<ISettings>` rendered by `FormItems.tsx`. Fields support conditional visibility (`when`), dynamic labels, and auto-indentation for nested fields.

**i18n**: `typesafe-i18n` with 20 locales. `src/L.ts` is the singleton entry — typed translation functions like `L.exportImage()`. Base locale is `en`. Translation files at `src/i18n/<locale>/index.ts`.

**Settings**: `ISettings` type in `src/type.d.ts` (global ambient), defaults in `src/settings.ts`. Two form systems: Obsidian native settings tab (`formConfig.ts` → `SettingItem[]`) and in-modal React form (`FormSchema<ISettings>` in `ModalContent`).

## Build Config

- esbuild outputs CJS `main.js`, externalizes `obsidian`, `electron`, `@codemirror/*`, `@lezer/*`, Node builtins
- JSX is `preserve` in tsconfig — esbuild handles the transform
- TypeScript strict: `noImplicitAny`, `strictNullChecks`

## Key Files

| File | Role |
|------|------|
| `src/ExportImagePlugin.ts` | Plugin lifecycle, menus, commands |
| `src/utils/capture.ts` | Core export: save, copy, split pagination, batch export, watermark image caching |
| `src/utils/makeHTML.tsx` | Markdown → React Target rendering pipeline |
| `src/utils/split.ts` | Split position calculation (fixed/hr/auto modes) |
| `src/utils/asyncRender.ts` | MutationObserver-based Mermaid render detection |
| `src/components/common/Target.tsx` | forwardRef export target with watermark, metadata, author info |
| `src/components/common/form/FormItems.tsx` | Renders form schema; handles conditional visibility (`when`) and auto-indentation |
| `src/components/file/ModalContent.tsx` | Export preview modal; defines dynamic `FormSchema<ISettings>` for real-time settings editing |
| `src/type.d.ts` | Global types: `ISettings`, `FileFormat`, `SplitMode`, `ResolutionMode` |

## Platform Considerations

- Desktop: file download via native `<a download>` + `URL.createObjectURL`
- Mobile: file save via `app.vault.createBinary` into vault
- Use `Platform.isMobile` from `obsidian` to branch

## Form System Rules

**Path discipline**: `FormSchema` field `path` must exactly match an `ISettings` property path. ModalContent uses `lodash.set(settings, path, value)` to mutate — wrong paths silently write to non-existent locations and break live preview sync.

**Dynamic schema**: Use `getFormSchema(settings)` function when fields/labels depend on other settings (e.g., `padding.unified` toggles between single "all sides" field and 4 independent fields).

**Conditional fields**: `when` supports `{ path, flag }` (shown when `settings[path] === flag`) or `(settings) => boolean`. Conditional fields are auto-indented with `paddingLeft: 20px` in `FormItems.tsx`.

**Label discipline**: All labels must use `L.xxx()` i18n calls. Never hardcode English strings in form schemas.

## i18n Workflow

1. Add new translation keys to `src/i18n/en/index.ts` (base locale)
2. Add Chinese translations to `src/i18n/zh/index.ts`
3. Add placeholder strings to all other 18 locale files to satisfy `satisfies Translation` type check
4. Run `npm run typesafe-i18n` to regenerate `src/i18n/i18n-types.ts`
5. Import `L` from `src/L.ts` and use typed functions in UI code

## Coding Conventions

- TypeScript with `"strict": true` preferred
- Keep `main.ts` minimal: only plugin lifecycle (onload, onunload, addCommand). Delegate feature logic to modules
- Split files exceeding ~200-300 lines into focused modules
- Bundle everything into `main.js` (no unbundled runtime deps)
- Avoid Node/Electron APIs if you want mobile compatibility; set `isDesktopOnly` accordingly
- Prefer `async/await` over promise chains; handle errors gracefully
- All user-facing strings go through `L.xxx()` — no hardcoded labels in form schemas or UI components

## Agent do/don't

**Do**
- Add commands with stable IDs (don't rename once released)
- Provide defaults and validation in settings
- Write idempotent code paths so reload/unload doesn't leak listeners or intervals
- Use `this.register*` helpers for everything that needs cleanup
- Run `npm run typesafe-i18n` after adding translation keys

**Don't**
- Hardcode English UI labels — always use `L.xxx()`
- Use incorrect form paths that don't exist in `ISettings`
- Introduce network calls without an obvious user-facing reason and documentation
- Ship features that require cloud services without clear disclosure and explicit opt-in
- Store or transmit vault contents unless essential and consented
