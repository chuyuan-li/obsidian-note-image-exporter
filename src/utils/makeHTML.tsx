 
 
import {
  type App,
  MarkdownRenderChild,
  MarkdownRenderer,
  type TFile,
} from 'obsidian';
import React from 'react';
import { type Root, createRoot } from 'react-dom/client';
import Target from 'src/components/common/Target';
import {
  getMetadata, getMetadataMap, waitForAsyncRenders, waitForElement,
} from '.';

function waitForTargetReady(ready: Promise<void>, timeout = 2000): Promise<void> {
  return new Promise(resolve => {
    const timer = window.setTimeout(resolve, timeout);
    ready.then(() => {
      window.clearTimeout(timer);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          resolve();
        });
      });
    }).catch(() => {
      window.clearTimeout(timer);
      resolve();
    });
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
  const renderChild = new MarkdownRenderChild(element);
  try {
    await MarkdownRenderer.render(
      app,
      markdown,
      element.createDiv(),
      file.path,
      renderChild,
    );
    await waitForAsyncRenders(element);
  } finally {
    renderChild.unload();
  }

  const metadataMap = getMetadataMap(app);

  const frontmatter = getMetadata(file, app);

  const root: Root = createRoot(container);
  const targetReady = new Promise<void>(resolve => {
    root.render(
      <Target
        frontmatter={frontmatter}
        setting={settings}
        title={file.basename}
        markdownEl={element}
        app={app}
        metadataMap={metadataMap}
        isProcessing
        onReady={resolve}
      />,
    );
  });

  const exportRoot = await waitForElement(container, '.export-image-root', 2000);
  await waitForTargetReady(targetReady);
  return {
    element: exportRoot,
    cleanup: () => {
      root.unmount();
      container.empty();
    },
  };
}
