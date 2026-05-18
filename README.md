# Note Image Exporter — Obsidian Plugin

Export Obsidian notes as images (PNG/JPG/WebP/PDF) with pagination, watermark, and batch export.

## Features

- **Formats**: PNG (lossless/lossy), JPG, WebP, PDF
- **Pagination**: Fixed height, HR rule, or auto-split long notes
- **Watermark**: Text or image overlay with opacity/rotation/position controls
- **Author info**: Name, remark, avatar with align/position options
- **Batch export**: Export entire folders with 3-concurrent processing
- **Multi-language**: 20 locales via typesafe-i18n
- **Quick export**: Copy selection or entire file to clipboard in one click
- **Live preview**: Real-time preview in export modal with adjustable settings

## Installation

### Manual (for testing)

```bash
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to:

```
<Vault>/.obsidian/plugins/note-image-exporter/
```

Then enable **Note Image Exporter** in **Settings → Community plugins**.

### From Community Plugins

Search "Note Image Exporter" in Obsidian's Community Plugins browser and install.

## Usage

- **Right-click file/folder** → Export to image
- **Right-click editor** → Export selection to image / Export to image
- **Command palette** → "Export as an image" / "Export selection to image"
- **Settings** → Configure default format, resolution, padding, watermark, split mode

### Resolution Behavior

| Setting | DPR=1 (Standard) | DPR=2 (Retina) | DPR=3 (Super Retina) |
|---------|-----------------|----------------|---------------------|
| 1x | 1× | 2× | 3× |
| 2x | 2× | 4× | 4× (capped) |
| 3x | 3× | 4× (capped) | 4× (capped) |
| 4x | 4× | 4× (capped) | 4× (capped) |

Maximum scale is capped at 4× to prevent OOM on large notes.

### Pagination Modes

- **None**: Single image
- **Fixed**: Split by pixel height
- **HR**: Split at `---` horizontal rules in markdown
- **Auto**: Intelligent split based on content boundaries

### Padding Modes

- **Unified** (default): Single value applies to all 4 sides
- **Independent**: Configure top/right/bottom/left separately

Toggle between modes in the export modal or settings.

## Development

```bash
npm install
npm run dev           # Watch mode with sourcemaps
npm run build         # Type-check + production bundle
npm run typesafe-i18n # Regenerate i18n types after editing translations
```

### Project Structure

```
src/
  ExportImagePlugin.ts    # Plugin lifecycle, commands, menus
  settings.ts             # Default settings
  formConfig.ts           # Settings UI schema
  SettingRenderer.ts      # Obsidian-native settings tab renderer
  L.ts                    # i18n singleton entry
  components/
    file/
      exportImage.tsx     # Single file export flow
      ModalContent.tsx    # Export preview modal with dynamic form schema
    folder/
      exportFolder.tsx    # Batch folder export
    common/
      Target.tsx          # Export preview component (watermark, metadata)
      form/
        FormItems.tsx     # Conditional form renderer with auto-indentation
  utils/
    capture.ts            # Core export: save, copy, split, batch
    makeHTML.tsx          # Markdown → React rendering pipeline
    split.ts              # Pagination position calculation
    asyncRender.ts        # Mermaid/async content detection
  i18n/                   # 20 locale translations
```

### Key Pipeline

1. `exportImage.tsx` renders markdown via `MarkdownRenderer.render`
2. `makeHTML.tsx` wraps it in React `<Target>` with watermark/metadata
3. `capture.ts` captures via `html-to-image.toCanvas()` once, then crops per-page with Canvas `drawImage()`
4. Desktop: download via `<a download>`; Mobile: save to vault via `app.vault.createBinary`

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Width | 640px | Exported image width |
| Resolution | 3x | Scale multiplier (capped at 4× total) |
| Format | png0 | PNG lossless |
| Show filename | true | Include filename as title |
| Padding | 6px | Unified padding (all sides); toggle for independent control |
| Watermark | disabled | Text or image overlay |
| Split mode | none | Pagination behavior |
| Split height | 1000px | Page height for fixed mode |
| Overlap | 80px | Overlap between pages |

## Author

Created by [chuyuan-li](https://github.com/chuyuan-li).

## License

MIT
