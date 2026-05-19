 
 
import React from 'react';
import {
  type App,
  type FrontMatterCache,
  MarkdownRenderChild,
  MarkdownRenderer,
  Modal,
  Notice,
  type TFile,
} from 'obsidian';
import { createRoot } from 'react-dom/client';
import L from '../../L';
import ModalContent from './ModalContent';
import Target from '../common/Target';
import { getMetadataMap, waitForAsyncRenders, waitForElement } from 'src/utils';
import { copy } from 'src/utils/capture';
import { hasValidExportWidth } from 'src/utils/settings';

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

export default async function (
  app: App,
  settings: ISettings,
  markdown: string,
  file: TFile,
  frontmatter: FrontMatterCache | undefined,
  type: 'file' | 'selection',
) {
  const el = activeDocument.createElement('div');
  const skipConfig = type === 'selection' && settings.quickExportSelection;

  if (skipConfig) {
    if (!hasValidExportWidth(settings)) {
      new Notice(L.invalidWidth());
      return;
    }

    await loadDocumentContent(app, el, markdown, file.path);

    const div = createDiv();
    div.setCssStyles({
      width: `${settings.width || 400}px`,
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
    });
    activeDocument.body.appendChild(div);
    const root = createRoot(div);
    const targetReady = new Promise<void>(resolve => {
      root.render(
        <Target
          isProcessing={true}
          markdownEl={el}
          setting={{ ...settings, showMetadata: false, showFilename: false, split: { overlap: 0, height: 0, mode: 'none' } }}
          frontmatter={undefined}
          title={file.basename}
          metadataMap={{}}
          app={app}
          onReady={resolve}
        />,
      );
    });

    try {
      const target = await waitForElement(div, '.export-image-root', 2000);
      await waitForTargetReady(targetReady);
      await copy(target, settings.resolutionMode, settings.format);
    } catch (e) {
      console.error(e);
      new Notice(L.copyFail());
    } finally {
      root.unmount();
      div.remove();
    }
  }
  else {
    const modal = new Modal(app);
    modal.setTitle(L.imageExportPreview());
    modal.modalEl.setCssStyles({
      width: '85vw',
      maxWidth: '1500px',
    });
    modal.open();
    const root = createRoot(modal.contentEl);

    const metadataMap = getMetadataMap(app);

    root.render(
      <ModalContent
        markdownEl={el}
        settings={settings}
        frontmatter={frontmatter}
        title={file.basename}
        metadataMap={metadataMap}
        app={app}
        modalContainerEl={modal.containerEl}
      />,
    );

    await loadDocumentContent(app, el, markdown, file.path);

    const loadedEvent = new CustomEvent("export-image-content-loaded");
    activeDocument.dispatchEvent(loadedEvent);

    modal.onClose = () => {
      root?.unmount();
    };
  }
}

async function loadDocumentContent(app: App, el: HTMLElement, markdown: string, filePath: string) {
  const container = activeDocument.createElement('div');
  let renderChild: MarkdownRenderChild | undefined;
  try {
    container.className = 'markdown-preview-view markdown-rendered';
    container.setCssStyles({
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      width: '1200px',
    });
    activeDocument.body.appendChild(container);

    renderChild = new MarkdownRenderChild(container);
    await MarkdownRenderer.render(app, markdown, container, filePath, renderChild);
    await waitForAsyncRenders(container);

    container.querySelectorAll('.edit-block-button, .callout-fold').forEach(it => it.remove());

    const styleEl = activeDocument.createElement('style');
    styleEl.textContent = `
      .export-image-root .list-bullet {
          margin-left: -24px !important;
      }
      .export-image-root .cm-formatting.cm-formatting-list.cm-formatting-list-ul.cm-list-1 {
          margin-left: 12px !important;
      }
      .export-image-root .list-bullet:after {
          left: 10px !important;
      }
    `;
    container.prepend(styleEl);

    el.replaceChildren(...Array.from(container.childNodes, child => child.cloneNode(true)));
    return el;
  } catch (error) {
    console.error('[ExportImage] Error:', error);
    return el;
  } finally {
    renderChild?.unload();
    container.remove();
  }
}
