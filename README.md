# Note Image Exporter

English | [中文](README.zh-CN.md)

Export Obsidian notes, selections, and folders as shareable images or PDFs with live preview, split output, watermarks, and author info.

![An exported Obsidian note with Mermaid, math, code, watermark, and author info](docs/readme/Note_Image_Exporter_Demo.png)

Note Image Exporter keeps Obsidian rendering in the result, so a shared image can include content such as Mermaid diagrams, math, code blocks, callouts, metadata, and your current note styling.

## Quick start

1. Right-click a note, selected text, or folder.
2. Choose **Export to image**, **Export selection to image**, or **Export all notes to image**.
3. Adjust the preview, then copy the result or save it as a file.

![Image export preview with export settings](docs/readme/export-preview.png)

## Features

- Export notes as PNG, JPG, WebP, or PDF.
- Copy an image directly from the export preview when the selected format supports it.
- Preview changes before export, including width, padding, format, resolution, watermark, and author info.
- Split long notes with fixed-height, horizontal-rule, or automatic paragraph-based pagination.
- Add text or image watermarks for shared images.
- Embed a hidden asset mark into exported image pixels for later matching.
- Add author name, extra text, avatar, alignment, and placement to exported images.
- Export every Markdown note in a folder from the file menu.
- Use the plugin in any of its 20 available languages.

## Usage

### Export a note

- Right-click a Markdown file in the file explorer and choose **Export to image**.
- Right-click inside the editor and choose **Export to image**.
- Open the command palette and run **Export as an image**.

### Export a selection

- Select Markdown content in the editor.
- Right-click and choose **Export selection to image**, or run the matching command from the command palette.
- Enable quick selection export in the plugin settings when you want selected content copied with fewer steps.

### Export a folder

- Right-click a folder in the file explorer and choose **Export all notes to image**.
- Select the notes to export in the batch export dialog.

## Export options

### Output formats

| Format | Typical use |
| --- | --- |
| PNG | Default image output. Use the transparent PNG option when the background should stay transparent. |
| JPG | Smaller image files for sharing when transparency is not needed. |
| WebP | Compact image output when the platform supports it. |
| PDF | A single-page PDF output based on the exported note image. |

### Split modes

| Mode | Behavior |
| --- | --- |
| No split | Export one image. |
| Fixed height | Split by page height with configurable overlap. |
| Horizontal rule | Split at Markdown horizontal rules such as `---`. |
| Auto | Split near paragraph boundaries while targeting the configured page height. |

### Layout and decoration

- Set the export width and resolution scaling for the target sharing context.
- Use uniform padding or configure top, right, bottom, and left padding independently.
- Show the filename as a title when the note needs its Obsidian title in the image.
- Include frontmatter metadata when it should be visible in the export.
- Add author info above or below the note and align it to the left, center, or right.

Resolution scaling is capped at 4x total output scale to reduce memory pressure on large notes.

## Platform notes

- On desktop, saved exports are downloaded as files.
- On mobile, saved exports are written into the current vault.
- Clipboard copy availability depends on the output format and platform. Save the file when copy is unavailable.

## Installation

### Community plugins

Install **Note Image Exporter** from Obsidian's Community plugins browser when it is available there.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from a release.
2. Put them in `<Vault>/.obsidian/plugins/note-image-exporter/`.
3. Enable **Note Image Exporter** in **Settings** -> **Community plugins**.

## Privacy and network use

Notes are rendered and exported locally. The plugin does not send note content to a service.

Network requests are only used for remote image URLs that you provide for export assets, such as an image watermark or avatar. Use local vault images or uploaded images when you do not want a remote image fetched during export.

## Development

```bash
npm install
npm run dev
npm run build
npm run typesafe-i18n
```

## Author

Created by [chuyuan-li](https://github.com/chuyuan-li).

## License

MIT
