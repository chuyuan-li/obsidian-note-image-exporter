import {
  type App,
  MarkdownRenderChild,
  MarkdownRenderer,
  type TAbstractFile,
  TFile,
  normalizePath,
} from 'obsidian';

export function isMarkdownFile(file: TFile | TAbstractFile) {
  return file instanceof TFile && ['md', 'markdown'].includes(file.extension);
}

export async function fileToBase64(file: Blob): Promise<string> {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'));
    };
  });
}

export function fileToUrl(file: File) {
  return URL.createObjectURL(file);
}

export async function getSizeOfImage(
  url: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => {
      resolve({
        width: Math.round(image.width / 2),
        height: Math.round(image.height / 2),
      });
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      image.remove();
    });

    image.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      image.remove();
    };

    image.src = url;
  });
}

export async function createHtml(
  path: string,
  app: App,
): Promise<HTMLDivElement> {
  const div = createDiv();
  const renderChild = new MarkdownRenderChild(div);
  await MarkdownRenderer.render(
    app,
    `![](${normalizePath(path).replaceAll(' ', '%20')})`,
    div,
    '',
    renderChild,
  );
  renderChild.unload();
  return div;
}

export function getMetadata(file: TFile, app: App) {
  return app.metadataCache.getFileCache(file)?.frontmatter;
}

const metadataTypes = new Set<MetadataType>([
  'text',
  'date',
  'datetime',
  'checkbox',
  'multitext',
  'number',
  'tags',
  'aliases',
]);

function isMetadataType(type: string): type is MetadataType {
  return metadataTypes.has(type as MetadataType);
}

export function getMetadataMap(app: App): Record<string, { type: MetadataType }> {
  return Object.fromEntries(
    Object.entries(app.metadataCache.getAllPropertyInfos()).map(([name, info]) => [
      name,
      { type: isMetadataType(info.type) ? info.type : 'text' },
    ]),
  );
}

export async function delay(time: number) {
  return new Promise(resolve => {
    window.setTimeout(() => {
      resolve(true);
    }, time);
  });
}

export function getMime(format: FileFormat) {
  return `image/${format.includes('png') ? 'png' : (format === 'jpg' ? 'jpeg' : format)}`;
}

export function waitForElement(
  parent: HTMLElement,
  selector: string,
  timeout: number,
): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const existing = parent.querySelector<HTMLElement>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = parent.querySelector<HTMLElement>(selector);
      if (element) {
        window.clearTimeout(timer);
        observer.disconnect();
        resolve(element);
      }
    });

    const timer = window.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);

    observer.observe(parent, { childList: true, subtree: true });
  });
}

export { waitForAsyncRenders } from './asyncRender';
