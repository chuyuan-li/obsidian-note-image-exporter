 
 
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
import { getMetadataMap, waitForAsyncRenders } from 'src/utils';
import { copy } from 'src/utils/capture';

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
    root.render(
      <Target
        isProcessing={true}
        markdownEl={el}
        setting={{ ...settings, showMetadata: false, showFilename: false, split: { overlap: 0, height: 0, mode: 'none' } }}
        frontmatter={{}}
        title={file.basename}
        metadataMap={{}}
        app={app}
      />,
    );

    try {
      const target = await waitForElement(div, '.export-image-root', 2000);
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

function waitForElement(parent: HTMLElement, selector: string, timeout: number): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const el = parent.querySelector<HTMLElement>(selector);
    if (el) {
      resolve(el);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = parent.querySelector<HTMLElement>(selector);
      if (el) {
        window.clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });
    const timer = window.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
    observer.observe(parent, { childList: true, subtree: true });
  });
}

async function loadDocumentContent(app: App, el: HTMLElement, markdown: string, filePath: string) {
  const container = activeDocument.createElement('div');
  try {
    container.className = 'markdown-preview-view markdown-rendered';
    container.setCssStyles({
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      width: '1200px',
    });
    activeDocument.body.appendChild(container);

    const renderChild = new MarkdownRenderChild(container);
    await MarkdownRenderer.render(app, markdown, container, filePath, renderChild);
    renderChild.unload();
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
    container.remove();
  }
}
