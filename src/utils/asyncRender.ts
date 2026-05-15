export async function waitForAsyncRenders(
  container: HTMLElement,
  timeout = 5000,
): Promise<void> {
  const mermaidBlocks = container.querySelectorAll('pre code.language-mermaid');
  if (mermaidBlocks.length === 0) {
    return;
  }

  // Check immediately in case Mermaid has already rendered
  const existingSvgs = container.querySelectorAll('.mermaid svg');
  if (existingSvgs.length >= mermaidBlocks.length) {
    return;
  }

  return new Promise((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        observer.disconnect();
        resolve();
      }
    }, timeout);

    const observer = new MutationObserver(() => {
      const mermaidSvgs = container.querySelectorAll('.mermaid svg');
      if (mermaidSvgs.length >= mermaidBlocks.length) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          observer.disconnect();
          resolve();
        }
      }
    });

    observer.observe(container, { childList: true, subtree: true });
  });
}
