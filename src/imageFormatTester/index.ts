import {getMime} from 'src/utils';
import {jpg, png, webp} from './tiny';

async function tester(image: string) {
  try {
    const [, metadata, base64] = image.match(/^data:([^;]+);base64,(.+)$/) ?? [];
    if (!metadata || !base64) {
      return false;
    }
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: metadata });
    const data: ClipboardItem[] = [];
    data.push(
      new ClipboardItem({
        [blob.type]: blob,
      }),
    );
    await navigator.clipboard.write(data);
    return true;
  } catch {
    return false;
  }
}

const copyCache: Partial<Record<FileFormat, Promise<boolean>>> = {
  pdf: Promise.resolve(false),
};
const createCache: Partial<Record<FileFormat, boolean>> = {
  pdf: true,
};

export async function isCopiable(type: FileFormat) {
  if (type in copyCache) {
    return copyCache[type];
  }

  if (type === 'jpg') {
    copyCache[type] = tester(jpg);
    return copyCache[type];
  }

  if (type === 'webp') {
    copyCache[type] = tester(webp);
    return copyCache[type];
  }

  const result = tester(png);
  copyCache.png0 = result;
  copyCache.png1 = result;
  return result;
}

export async function isCreatable(type: FileFormat): Promise<boolean> {
  if (type in createCache) {
    return createCache[type]!;
  }

  const setCache = (value: boolean) => {
    if (type.includes('png')) {
      createCache.png0 = value;
      createCache.png1 = value;
    } else {
      createCache[type] = value;
    }
  };

  const canvas = activeDocument.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const mime = getMime(type);
  return new Promise(resolve => {
    try {
      canvas.toBlob(blob => {
        const isSupported = Boolean(blob) && blob?.type === mime;
        setCache(isSupported);
        resolve(isSupported);
      }, mime);
    } catch {
      setCache(false);
      resolve(false);
    }
  });
}
