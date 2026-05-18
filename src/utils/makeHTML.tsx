 
 
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
import {
  getMetadata, getMetadataMap, waitForAsyncRenders, waitForElement,
} from '.';

 
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
