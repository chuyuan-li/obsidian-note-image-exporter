import {
  Notice, Platform, requestUrl, type App, type TFile,
} from 'obsidian';
import JsPdf from 'jspdf';
import JSZip from 'jszip';
import * as htmlToImage from 'html-to-image';
import L from '../L';
import makeHTML from './makeHTML';
import { fileToBase64, getMime } from '.';
import { calculateSplitPositions, getElementMeasures } from './split';

function saveAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = activeDocument.createElement('a');
  a.href = url;
  a.download = filename;
  a.setCssStyles({ display: 'none' });
  activeDocument.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    activeDocument.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function getSolidBackground(el: HTMLElement): string {
  const backgroundColor = getComputedStyle(el).backgroundColor;
  return !backgroundColor || backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)'
    ? '#ffffff'
    : backgroundColor;
}

async function getBlob(el: HTMLElement, resolutionMode: ResolutionMode, format: Exclude<FileFormat, 'pdf'>): Promise<Blob> {
  const scale = resolutionMode === '2x' ? 2 : resolutionMode === '3x' ? 3 : resolutionMode === '4x' ? 4 : 1;
  const pixelRatio = window.devicePixelRatio || 1;
  const MAX_SCALE = 4;
  const finalScale = Math.min(scale * pixelRatio, MAX_SCALE);
  const mime = getMime(format);

  const blob = await htmlToImage.toBlob(el, {
    width: el.clientWidth,
    height: el.clientHeight,
    pixelRatio: finalScale,
    cacheBust: true,
    type: mime,
    backgroundColor: format === 'jpg' ? getSolidBackground(el) : undefined,
  });

  if (!blob) {
    throw new Error('Failed to generate image blob');
  }

  return blob;
}

async function makePdf(blob: Blob, el: HTMLElement) {
  const dataUrl = await fileToBase64(blob);
  const pdf = new JsPdf({
    unit: 'in',
    format: [el.clientWidth / 96, el.clientHeight / 96],
    orientation: el.clientWidth > el.clientHeight ? 'l' : 'p',
    compress: true,
  });
  pdf.addImage(
    dataUrl,
    'JPEG',
    0,
    0,
    el.clientWidth / 96,
    el.clientHeight / 96,
  );
  return pdf;
}

async function saveToVault(app: App, blob: Blob, filename: string) {
  const filePath = await app.fileManager.getAvailablePathForAttachment(filename);
  await app.vault.createBinary(filePath, await blob.arrayBuffer());
  return filePath;
}

export async function save(
  app: App,
  el: HTMLElement,
  title: string,
  resolutionMode: ResolutionMode,
  format: FileFormat,
  isMobile: boolean,
) {
  const filename = `${title.replaceAll(/\s+/g, '_')}.${format.replace(/\d$/, '')}`;
  switch (format) {
    case 'jpg':
    case 'webp':
    case 'png0':
    case 'png1': {
      const blob: Blob = await getBlob(el, resolutionMode, format);
      if (isMobile) {
        const filePath = await app.fileManager.getAvailablePathForAttachment(
          filename,
        );
        await app.vault.createBinary(filePath, await blob.arrayBuffer());
        new Notice(L.saveSuccess({ filePath }));
      } else {
        saveAs(blob, filename);
      }

      break;
    }

    case 'pdf': {
      const blob = await getBlob(el, resolutionMode, 'jpg');
      const pdf = await makePdf(blob, el);
      if (isMobile) {
        const filePath = await app.fileManager.getAvailablePathForAttachment(
          filename,
        );
        await app.vault.createBinary(filePath, pdf.output('arraybuffer'));
        new Notice(L.saveSuccess({ filePath }));
      } else {
        pdf.save(filename);
      }

      break;
    }
  }
}

export async function copy(
  el: HTMLElement,
  resolutionMode: ResolutionMode,
  format: FileFormat,
) {
  if (format === 'pdf') {
    new Notice(L.copyNotAllowed());
    return;
  }

  const blob = await getBlob(
    el,
    resolutionMode,
    format,
  );
  const data: ClipboardItem[] = [];
  data.push(
    new ClipboardItem({
      [blob.type]: blob,
    }),
  );
  await navigator.clipboard.write(data);
  new Notice(L.copiedSuccess());
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<void> {
  const executing = new Set<Promise<void>>();
  for (const task of tasks) {
    const p = task().then(() => { executing.delete(p); });
    executing.add(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
}

export async function saveMultipleFiles(
  files: TFile[],
  settings: ISettings,
  onProgress: (finished: number) => void,
  app: App,
) {
  let finished = 0;
  const { format, resolutionMode, split } = settings;

  const tasks = files.map(file => async () => {
    // Each concurrent task gets its own temporary container
    const tempContainer = activeDocument.createElement('div');
    tempContainer.setCssStyles({
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
    });
    activeDocument.body.appendChild(tempContainer);
    let cleanup: (() => void) | undefined;

    try {
      const result = await makeHTML(file, settings, app, tempContainer);
      cleanup = result.cleanup;
      const { element: el } = result;

      const target = {
        element: el,
        contentElement: el,
        setClip: (startY: number, height: number) => {
          el.setCssStyles({
            height: `${height}px`,
            overflow: 'hidden',
            transform: `translateY(-${startY}px)`,
          });
        },
        resetClip: () => {
          el.setCssStyles({
            height: '',
            overflow: '',
            transform: '',
          });
        },
      };

      if (split.mode === 'none') {
        await save(app, el, file.basename, resolutionMode, format, Platform.isMobile);
      } else {
        await saveAll(
          target,
          format,
          resolutionMode,
          split.height,
          split.overlap,
          split.mode,
          app,
          file.basename,
        );
      }
    } catch (err) {
      console.error(`Failed to export ${file.path}:`, err);
      new Notice(`${L.saveFail()}: ${file.basename}`);
    } finally {
      cleanup?.();
      tempContainer.remove();
      finished++;
      onProgress(finished);
    }
  });

  await runWithConcurrency(tasks, 3);
}

const IMAGE_URL_CACHE_MAX_ENTRIES = 10;
const imageUrlCache = new Map<string, string>();

function failSave(message = L.saveFail()): never {
  throw new Error(message);
}

export function revokeAllImageUrls() {
  for (const url of imageUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  imageUrlCache.clear();
}

export async function getRemoteImageUrl(url?: string) {
  if (!url || !url.startsWith('http')) {
    return url;
  }
  if (imageUrlCache.has(url)) {
    const cached = imageUrlCache.get(url)!;
    imageUrlCache.delete(url);
    imageUrlCache.set(url, cached);
    return cached;
  }
  try {
    const response = await requestUrl({
      url,
      method: 'GET',
    });
    const blob = new Blob([response.arrayBuffer], { type: response.headers['content-type'] || 'application/octet-stream' });
    const res = URL.createObjectURL(blob);
    if (imageUrlCache.size >= IMAGE_URL_CACHE_MAX_ENTRIES) {
      const oldestEntry = imageUrlCache.entries().next();
      if (!oldestEntry.done) {
        const [oldestUrl, oldestObjectUrl] = oldestEntry.value;
        URL.revokeObjectURL(oldestObjectUrl);
        imageUrlCache.delete(oldestUrl);
      }
    }
    imageUrlCache.set(url, res);
    return res;
  } catch (error) {
    console.error('Failed to load image:', error);
    return url;
  }
}

export async function saveAll(
  target: { element: HTMLElement; contentElement: HTMLElement; setClip: (startY: number, height: number) => void; resetClip: () => void },
  format: FileFormat,
  resolutionMode: ResolutionMode,
  splitHeight: number,
  splitOverlap: number,
  splitMode: SplitMode,
  app: App,
  title: string,
) {
  try {
    // 计算需要分割的页数和位置
    const totalHeight = target.contentElement.clientHeight;
    const elements = getElementMeasures(target.contentElement, splitMode);

    const splitPositions = calculateSplitPositions({
      mode: splitMode,
      height: splitHeight,
      overlap: splitOverlap,
      totalHeight,
    }, elements);

    const scale = resolutionMode === '2x' ? 2 : resolutionMode === '3x' ? 3 : resolutionMode === '4x' ? 4 : 1;
    const pixelRatio = window.devicePixelRatio || 1;
    const MAX_SCALE = 4;
    const finalScale = Math.min(scale * pixelRatio, MAX_SCALE);

    if (format === 'pdf') {
      // PDF 格式：一次 toCanvas + Canvas 裁剪
      const fullCanvas = await htmlToImage.toCanvas(target.element, {
        pixelRatio: finalScale,
        backgroundColor: getSolidBackground(target.contentElement),
      });

      let pdf: JsPdf | undefined;

      for (const { startY, height } of splitPositions) {
        const pageCanvas = activeDocument.createElement('canvas');
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = Math.round(height * finalScale);

        const ctx = pageCanvas.getContext('2d');
        if (!ctx) {
          failSave();
        }
        ctx.drawImage(
          fullCanvas,
          0, Math.round(startY * finalScale),
          fullCanvas.width, pageCanvas.height,
          0, 0,
          pageCanvas.width, pageCanvas.height,
        );

        const dataUrl = pageCanvas.toDataURL('image/jpeg', 0.92);

        if (!pdf) {
          pdf = new JsPdf({
            unit: 'in',
            format: [target.element.clientWidth / 96, height / 96],
            orientation: target.element.clientWidth > height ? 'l' : 'p',
            compress: true,
          });
        } else {
          pdf.addPage([target.element.clientWidth / 96, height / 96], target.element.clientWidth > height ? 'l' : 'p');
        }

        pdf.addImage(dataUrl, 'JPEG', 0, 0, target.element.clientWidth / 96, height / 96);
      }

      const filename = `${title.replaceAll(/\s+/g, '_')}.pdf`;
      if (!pdf) {
        failSave();
      }
      if (Platform.isMobile) {
        const filePath = await saveToVault(app, new Blob([pdf.output('arraybuffer')]), filename);
        new Notice(L.saveSuccess({ filePath }));
      } else {
        pdf?.save(filename);
      }
    } else {
      // 其他图片格式：一次 toCanvas + Canvas 裁剪
      const fullCanvas = await htmlToImage.toCanvas(target.element, {
        pixelRatio: finalScale,
        backgroundColor: format === 'jpg' ? getSolidBackground(target.contentElement) : undefined,
      });

      const MAX_PIXELS = 16384 * 16384;
      if (fullCanvas.width * fullCanvas.height > MAX_PIXELS) {
        failSave();
      }

      const ext = format.replace(/\d$/, '');
      const mime = getMime(format);
      const zip = new JSZip();
      const blobs: { blob: Blob; filename: string }[] = [];

      for (let i = 0; i < splitPositions.length; i++) {
        const { startY, height } = splitPositions[i];

        const pageCanvas = activeDocument.createElement('canvas');
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = Math.round(height * finalScale);

        const ctx = pageCanvas.getContext('2d');
        if (!ctx) {
          failSave();
        }
        ctx.drawImage(
          fullCanvas,
          0, Math.round(startY * finalScale),
          fullCanvas.width, pageCanvas.height,
          0, 0,
          pageCanvas.width, pageCanvas.height,
        );

        const blob = await new Promise<Blob | null>((resolve) => {
          pageCanvas.toBlob(resolve, mime, 0.92);
        });
        if (!blob) {
          failSave();
        }
        const filename = `${title.replaceAll(/\s+/g, '_')}_${i + 1}.${ext}`;
        blobs.push({ blob, filename });
      }

      if (Platform.isMobile) {
        for (const { blob, filename } of blobs) {
          const filePath = await saveToVault(app, blob, filename);
          new Notice(L.saveSuccess({ filePath }));
        }
      } else {
        for (const { blob, filename } of blobs) {
          zip.file(filename, blob);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${title.replaceAll(/\s+/g, '_')}.zip`);
      }
    }
  } finally {
    target.resetClip();
  }
}
