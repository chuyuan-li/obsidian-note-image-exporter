 
 
import {
  type App,
  MarkdownRenderChild,
  MarkdownRenderer,
  MarkdownView,
  type TFile,
} from 'obsidian';
import React from 'react';
import { type Root, createRoot } from 'react-dom/client';
import Target from 'src/components/common/Target';
import { getMetadata, getMetadataMap, waitForAsyncRenders } from '.';

function waitForElement(parent: HTMLElement, selector: string, timeout: number): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const el = parent.querySelector<HTMLElement>(selector);
    if (el) { resolve(el); return; }

    const timer = window.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);

    const observer = new MutationObserver(() => {
      const el = parent.querySelector<HTMLElement>(selector);
      if (el) {
        window.clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(parent, { childList: true, subtree: true });
  });
}

 
export default async function makeHTML(
  file: TFile,
  settings: ISettings,
  app: App,
  container: HTMLElement,
): Promise<{ element: HTMLElement; cleanup: () => void }> {
  const markdown = await app.vault.cachedRead(file);
  const element = activeDocument.createElement('div');
  await MarkdownRenderer.render(
    app,
    markdown,
    element.createDiv(),
    file.path,
    app.workspace.getActiveViewOfType(MarkdownView)
    || new MarkdownRenderChild(element),
  );
  await waitForAsyncRenders(element);

  const metadataMap = getMetadataMap(app);

  const frontmatter = getMetadata(file, app);

  const root: Root = createRoot(container);
  root.render(
    <Target
      frontmatter={frontmatter}
      setting={settings}
      title={file.basename}
      markdownEl={element}
      app={app}
      metadataMap={metadataMap}
      isProcessing
    />,
  );

  const exportRoot = await waitForElement(container, '.export-image-root', 2000);
  return {
    element: exportRoot,
    cleanup: () => {
      root.unmount();
      container.empty();
    },
  };
}
