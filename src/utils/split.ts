interface SplitPosition {
  startY: number;
  height: number;
}

interface SplitOptions {
  mode: SplitMode;
  height: number;
  overlap: number;
  totalHeight: number;
}

interface ElementMeasure {
  top: number;
  height: number;
}

/**
 * 获取元素位置信息
 * @param container 容器元素
 * @param mode 分割模式
 * @returns 元素位置信息数组
 */
export function getElementMeasures(container: HTMLElement, mode: SplitMode): ElementMeasure[] {
  if (mode === 'hr') {
    // 查找所有 hr 元素的位置
    const hrs = container.querySelectorAll('hr');
    return Array.from(hrs).map(hr => {
      const rect = hr.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        top: rect.top - containerRect.top,
        height: rect.height,
      };
    });
  } else if (mode === 'auto') {
    // 查找所有段落元素的位置
    const markdownContainer = container.querySelector<HTMLElement>('.export-image-markdown');
    if (!markdownContainer) {
      return [];
    }
    const contentRoot = (
      markdownContainer.children.length === 1
      && markdownContainer.firstElementChild instanceof HTMLElement
      && markdownContainer.firstElementChild.tagName === 'DIV'
    )
      ? markdownContainer.firstElementChild
      : markdownContainer;
    const paragraphs = Array.from(contentRoot.children);
    const containerRect = container.getBoundingClientRect();

    return paragraphs.map((p, index) => {
      const rect = p.getBoundingClientRect();
      const currentTop = rect.top - containerRect.top;

      if (index < paragraphs.length - 1) {
        // 如果不是最后一个元素，高度取到下一个元素的顶部
        const nextRect = paragraphs[index + 1].getBoundingClientRect();
        const nextTop = nextRect.top - containerRect.top;
        return {
          top: currentTop,
          height: nextTop - currentTop,
        };
      } else {
        // 最后一个元素使用其实际高度
        return {
          top: currentTop,
          height: rect.height,
        };
      }
    });
  }
  return [];
}

function calculateFixedPositions(
  height: number,
  overlap: number,
  totalHeight: number,
): SplitPosition[] {
  if (totalHeight <= 0) {
    return [];
  }

  const safeOverlap = Math.max(0, overlap);
  const effectiveHeight = Math.max(height, safeOverlap + 50, 1);
  const step = Math.max(1, effectiveHeight - safeOverlap);
  const positions: SplitPosition[] = [];

  for (let startY = 0; startY < totalHeight; startY += step) {
    const pageHeight = Math.min(effectiveHeight, totalHeight - startY);
    if (pageHeight <= 0) {
      break;
    }
    positions.push({ startY, height: pageHeight });
    if (startY + pageHeight >= totalHeight) {
      break;
    }
  }

  return positions;
}

/**
 * 计算分割位置
 * @param options 分割选项
 * @param elements 元素测量数据，仅在 hr 和 auto 模式下需要
 * @returns 分割位置数组
 */
export function calculateSplitPositions(
  options: SplitOptions,
  elements?: ElementMeasure[],
): SplitPosition[] {
  const { mode, height, overlap, totalHeight } = options;
  const positions: SplitPosition[] = [];
  if (mode === 'none') {
    positions.push({ startY: 0, height: totalHeight });
  } else if (mode === 'hr' && elements) {
    // 按分隔线切割
    const splitPoints = elements
      .map(el => el.top)
      .filter(y => y > 0 && y < totalHeight)
      .sort((a, b) => a - b);
    let lastY = 0;
    splitPoints.forEach(currentY => {
      if (currentY > lastY) {
        positions.push({ startY: lastY, height: currentY - lastY });
      }
      lastY = currentY;
    });
    // 添加最后一部分
    if (lastY < totalHeight) {
      positions.push({ startY: lastY, height: totalHeight - lastY });
    }
  } else if (mode === 'auto' && elements?.length) {
    // 按段落自动切割
    let currentStartY = 0;
    let currentHeight = 0;
    const effectiveHeight = Math.max(height, 1);

    for (let i = 0; i < elements.length; i++) {
      const item = elements[i];
      currentHeight += item.height + (i === 0 ? item.top : 0);
      if (currentHeight >= effectiveHeight) {
        positions.push({ startY: currentStartY, height: currentHeight });
        currentStartY += currentHeight;
        currentHeight = 0;
        continue;
      }
      const nextItem = elements[i + 1];
      if (!nextItem) {
        continue;
      }
      const delta = effectiveHeight - currentHeight;
      if (delta < nextItem.height / 2) {
        positions.push({ startY: currentStartY, height: currentHeight });
        currentStartY += currentHeight;
        currentHeight = 0;
      }
    };
    // 添加最后一部分
    if (currentStartY < totalHeight) {
      positions.push({ startY: currentStartY, height: totalHeight - currentStartY });
    }
  } else {
    // 固定高度模式
    positions.push(...calculateFixedPositions(height, overlap, totalHeight));
  }
  return positions;
}

/**
 * 计算分割线位置
 * @param options 分割选项
 * @param elements 元素测量数据，仅在 hr 和 auto 模式下需要
 * @returns 分割线位置数组
 */
export function calculateSplitLines(
  options: SplitOptions,
  elements?: ElementMeasure[],
): number[] {
  const positions = calculateSplitPositions(options, elements);
  // 除了最后一个位置，其他位置都需要显示分割线
  return positions.slice(0, -1).map(p => p.startY + p.height);
} 
