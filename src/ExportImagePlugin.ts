import {
  Plugin,
  PluginSettingTab,
  type App,
  TFile,
  Notice,
  TFolder,
  Editor,
  MarkdownView,
  FileSystemAdapter,
  Platform,
  normalizePath,
} from 'obsidian';
import L from './L';
import { isMarkdownFile, getMetadata } from './utils';
import {
  createExportBlob,
  createSplitExportBlob,
  revokeAllImageUrls,
} from './utils/capture';
import { mergeSettings } from './settings';
import exportFolder from './components/folder/exportFolder';
import { createSettingConfig } from './formConfig';
import { SettingRenderer } from './SettingRenderer';
import exportImage from './components/file/exportImage';
import makeHTML from './utils/makeHTML';
import { hasValidExportWidth } from './utils/settings';

type SettingsRecord = Record<string, unknown>;
type PathModule = {
  dirname: (path: string) => string;
  extname: (path: string) => string;
  isAbsolute: (path: string) => boolean;
  relative: (from: string, to: string) => string;
};
type FsPromisesModule = {
  mkdir: (path: string, options: { recursive: true }) => Promise<string | undefined>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
};

const fileFormats = new Set<FileFormat>(['png0', 'png1', 'jpg', 'pdf', 'webp']);
const resolutionModes = new Set<ResolutionMode>(['1x', '2x', '3x', '4x']);
const splitModes = new Set<SplitMode>(['none', 'fixed', 'hr', 'auto']);

function getPathModule(): PathModule {
  // eslint-disable-next-line import/no-nodejs-modules, @typescript-eslint/no-require-imports
  return require('path') as PathModule;
}

function getFsPromisesModule(): FsPromisesModule {
  // eslint-disable-next-line import/no-nodejs-modules, @typescript-eslint/no-require-imports
  return require('fs/promises') as FsPromisesModule;
}

function isRecord(value: unknown): value is SettingsRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeInto<T>(target: T, override: DeepPartial<T> | undefined): T {
  if (!isRecord(target) || !isRecord(override)) {
    return override === undefined ? target : override as T;
  }

  const targetRecord: SettingsRecord = target;
  for (const [key, value] of Object.entries(override)) {
    if (isRecord(targetRecord[key]) && isRecord(value)) {
      mergeInto(targetRecord[key], value);
    } else if (value !== undefined) {
      targetRecord[key] = value;
    }
  }

  return target;
}

function getExpectedExtension(format: FileFormat, splitMode: SplitMode): string {
  if (splitMode !== 'none' && format !== 'pdf') {
    return '.zip';
  }
  if (format === 'pdf') {
    return '.pdf';
  }
  return `.${format.replace(/\d$/, '')}`;
}

function validateCliSettings(settings: ISettings): void {
  if (!fileFormats.has(settings.format)) {
    throw new Error(`Invalid format: ${String(settings.format)}`);
  }
  if (!resolutionModes.has(settings.resolutionMode)) {
    throw new Error(`Invalid resolutionMode: ${String(settings.resolutionMode)}`);
  }
  if (!settings.split || !splitModes.has(settings.split.mode)) {
    throw new Error(`Invalid split.mode: ${String(settings.split?.mode)}`);
  }
}

export default class ExportImagePlugin extends Plugin {
  settings: ISettings;

  async exportFile(file: TFile) {
    const frontmatter = getMetadata(file, this.app);
    const markdown = await this.app.vault.cachedRead(file);
    await exportImage(this.app, this.settings, markdown, file, frontmatter, 'file');
  }

  private getCliSettings(options: DeepPartial<ISettings> | undefined): ISettings {
    return mergeInto(structuredClone(this.settings), options);
  }

  private getVaultRelativePath(input: string): string {
    const nodePath = getPathModule();
    if (!nodePath.isAbsolute(input)) {
      return normalizePath(input);
    }

    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof FileSystemAdapter)) {
      throw new Error('Absolute input paths require a desktop file system vault');
    }

    const relativePath = nodePath.relative(adapter.getBasePath(), input);
    if (!relativePath || relativePath.startsWith('..') || nodePath.isAbsolute(relativePath)) {
      throw new Error(`Input file is not inside this vault: ${input}`);
    }

    return normalizePath(relativePath);
  }

  private getCliFile(input: string): TFile {
    const relativePath = this.getVaultRelativePath(input);
    const file = this.app.vault.getAbstractFileByPath(relativePath);
    if (!(file instanceof TFile) || !isMarkdownFile(file)) {
      throw new Error(`Markdown file not found: ${input}`);
    }
    return file;
  }

  private validateOutputPath(output: string, format: FileFormat, splitMode: SplitMode): void {
    const nodePath = getPathModule();
    if (!nodePath.isAbsolute(output)) {
      throw new Error(`Output must be an absolute path: ${output}`);
    }

    const expectedExtension = getExpectedExtension(format, splitMode);
    const actualExtension = nodePath.extname(output).toLowerCase();
    if (actualExtension !== expectedExtension) {
      throw new Error(`Output extension must be ${expectedExtension} for format=${format} and split.mode=${splitMode}`);
    }
  }

  async exportFileToPath(request: CliExportRequest): Promise<CliExportResult> {
    if (Platform.isMobile) {
      throw new Error('exportFileToPath is only supported on desktop');
    }

    if (!request?.input) {
      throw new Error('Missing input');
    }
    if (!request.output) {
      throw new Error('Missing output');
    }

    const settings = this.getCliSettings(request.options);
    validateCliSettings(settings);
    if (!hasValidExportWidth(settings)) {
      throw new Error('Invalid export width');
    }
    this.validateOutputPath(request.output, settings.format, settings.split.mode);

    const file = this.getCliFile(request.input);
    const tempContainer = activeDocument.createElement('div');
    tempContainer.setCssStyles({
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
    });
    activeDocument.body.appendChild(tempContainer);

    let cleanup: (() => void) | undefined;
    try {
      const result = await makeHTML(file, settings, this.app, tempContainer);
      cleanup = result.cleanup;

      const blob = settings.split.mode === 'none'
        ? await createExportBlob(
          result.element,
          settings.resolutionMode,
          settings.format,
          settings.assetMark,
        )
        : await createSplitExportBlob(
          {
            element: result.element,
            contentElement: result.element,
            setClip: (startY: number, height: number) => {
              result.element.setCssStyles({
                height: `${height}px`,
                overflow: 'hidden',
                transform: `translateY(-${startY}px)`,
              });
            },
            resetClip: () => {
              result.element.setCssStyles({
                height: '',
                overflow: '',
                transform: '',
              });
            },
          },
          settings.format,
          settings.resolutionMode,
          settings.split.height,
          settings.split.overlap,
          settings.split.mode,
          file.basename,
          settings.assetMark,
        );

      const bytes = new Uint8Array(await blob.arrayBuffer());
      const nodePath = getPathModule();
      const { mkdir, writeFile } = getFsPromisesModule();
      await mkdir(nodePath.dirname(request.output), { recursive: true });
      await writeFile(request.output, bytes);

      return {
        ok: true,
        input: file.path,
        output: request.output,
        format: settings.format,
        splitMode: settings.split.mode,
        bytes: bytes.byteLength,
      };
    } finally {
      cleanup?.();
      tempContainer.remove();
    }
  }

  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && isMarkdownFile(file)) {
          menu.addItem(item => {
            item
              .setTitle(L.exportImage())
              .setIcon('image-down')
              .onClick(async () => {
                await this.exportFile(file);
              });
          });
        } else if (file instanceof TFolder) {
          menu.addItem(item => {
            item
              .setTitle(L.exportFolder())
              .setIcon('image-down')
              .onClick(async () => {
                await exportFolder(this.app, this.settings, file);
              });
          });
        }
      }),
    );

    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor) => {
        const file = editor.editorComponent?.file ?? this.app.workspace.getActiveFile();
        if (!file || !isMarkdownFile(file)) {
          return;
        }
        const frontmatter = getMetadata(file, this.app);

        if (editor.somethingSelected()) {
          menu.addItem(item => {
            item
              .setTitle(L.exportSelectionImage())
              .setIcon('text-select')
              .onClick(async () =>
                exportImage(
                  this.app,
                  this.settings,
                  editor.getSelection(),
                  file,
                  frontmatter,
                  'selection',
                ),
              );
          });
        }

        menu.addItem(item => {
          item
            .setTitle(L.exportImage())
            .setIcon('image-down')
            .onClick(async () =>
              exportImage(
                this.app,
                this.settings,
                editor.getValue(),
                file,
                frontmatter,
                'file',
              ),
            );
        });
      }),
    );

    this.addCommand({
      id: 'export-image',
      name: L.command(),
      checkCallback: (checking: boolean) => {
        // If checking is true, we're simply "checking" if the command can be run.
        // If checking is false, then we want to actually perform the operation.
        if (!checking) {
          void (async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (
              !activeFile
              || !['md', 'markdown'].includes(activeFile.extension)
            ) {
              new Notice(L.noActiveFile());
              return;
            }

            const frontmatter = getMetadata(activeFile, this.app);
            const markdown = await this.app.vault.cachedRead(activeFile);
            await exportImage(
              this.app,
              this.settings,
              markdown,
              activeFile,
              frontmatter,
              'file',
            );
          })();
        }
        // This command will only show up in Command Palette when the check function returns true
        return true;
      },
    });

    this.addCommand({
      id: 'export-image-selection',
      name: L.exportSelectionImage(),
      editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
        const file = view.file;
        if (!file || !['md', 'markdown'].includes(file.extension)) {
          return false;
        }
        const frontmatter = getMetadata(file, this.app);
        const selection = editor.getSelection();
        if (!selection) {
          return false;
        }
        if (!checking) {
          void exportImage(
            this.app,
            this.settings,
            selection,
            file,
            frontmatter,
            'selection',
          );
        }
        return true;
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new ImageSettingTab(this.app, this));
  }

  onunload() {
    revokeAllImageUrls();
  }

  async loadSettings() {
    this.settings = mergeSettings(await this.loadData() as Partial<ISettings> | null);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ImageSettingTab extends PluginSettingTab {
  plugin: ExportImagePlugin;
  settingRenderer: SettingRenderer;

  constructor(app: App, plugin: ExportImagePlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.settingRenderer = new SettingRenderer(app, plugin, this.containerEl);
  }

  display(): void {
    void this.renderSettings();
  }

  private async renderSettings(): Promise<void> {
    await this.settingRenderer.render(await createSettingConfig(this.app));
  }
}
