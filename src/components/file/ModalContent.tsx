import { type App, type FrontMatterCache, Notice, Platform } from 'obsidian';
import React, {
  useState, useRef, type FC, useEffect, useCallback,
} from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { isCopiable } from 'src/imageFormatTester';
import { copy, save, saveAll } from '../../utils/capture';
import L from '../../L';
import Target, { type TargetRef } from '../common/Target';
import FormItems from '../common/form/FormItems';
import { formatAvailable, getAvailableFormats } from 'src/settings';

const getFormSchema = (settings: ISettings, availableFormats: FileFormat[]): FormSchema<ISettings> => [
  {
    label: L.includingFilename(),
    path: 'showFilename',
    type: 'boolean',
  },
  {
    label: L.imageWidth(),
    path: 'width',
    type: 'number',
  },
  {
    label: L.setting.padding.unified(),
    path: 'padding.unified',
    type: 'boolean',
  },
  {
    path: 'padding.top',
    label: settings.padding?.unified !== false ? L.setting.padding.all() : L.setting.padding.top(),
    desc: settings.padding?.unified !== false ? undefined : L.setting.padding.description(),
    type: 'number',
    when: { flag: true, path: 'padding.unified' },
  },
  {
    path: 'padding.top',
    label: L.setting.padding.top(),
    desc: L.setting.padding.description(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'padding.right',
    label: L.setting.padding.right(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'padding.bottom',
    label: L.setting.padding.bottom(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'padding.left',
    label: L.setting.padding.left(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'split.mode',
    label: L.setting.split.mode.label(),
    desc: L.setting.split.mode.description(),
    type: 'select',
    options: [
      { text: L.setting.split.mode.none(), value: 'none' },
      { text: L.setting.split.mode.fixed(), value: 'fixed' },
      { text: L.setting.split.mode.hr(), value: 'hr' },
      { text: L.setting.split.mode.auto(), value: 'auto' },
    ],
  },
  {
    path: 'resolutionMode',
    label: L.setting.resolutionMode.label(),
    desc: L.setting.resolutionMode.description(),
    type: 'select',
    options: [
      { text: "1x", value: '1x' },
      { text: "2x", value: '2x' },
      { text: "3x", value: '3x' },
      { text: "4x", value: '4x' },
    ],
  },
  {
    path: 'split.height',
    desc: L.setting.split.height.description(),
    label: L.setting.split.height.label(),
    type: 'number',
    when: (settings) => settings.split.mode !== 'none' && settings.split.mode !== 'hr',
  },
  {
    path: 'split.overlap',
    desc: L.setting.split.overlap.description(),
    label: L.setting.split.overlap.label(),
    type: 'number',
    when: (settings) => settings.split.mode === 'fixed',
  },
  {
    label: L.setting.userInfo.show(),
    path: 'authorInfo.show',
    type: 'boolean',
  },
  {
    label: L.setting.userInfo.name(),
    path: 'authorInfo.name',
    type: 'string',
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.userInfo.remark(),
    path: 'authorInfo.remark',
    type: 'string',
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.userInfo.avatar.title(),
    path: 'authorInfo.avatar',
    type: 'string',
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.userInfo.align(),
    path: 'authorInfo.align',
    type: 'select',
    options: [
      { text: L.setting.userInfo.alignOptions.left(), value: 'left' },
      { text: L.setting.userInfo.alignOptions.center(), value: 'center' },
      { text: L.setting.userInfo.alignOptions.right(), value: 'right' },
    ],
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.watermark.enable.label(),
    path: 'watermark.enable',
    type: 'boolean',
  },
  {
    label: L.setting.watermark.type.label(),
    path: 'watermark.type',
    type: 'select',
    options: [
      { text: L.setting.watermark.type.text(), value: 'text' },
      { text: L.setting.watermark.type.image(), value: 'image' },
    ],
    when: { flag: true, path: 'watermark.enable' },
  },
  {
    label: L.setting.watermark.text.content(),
    path: 'watermark.text.content',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.text.fontSize(),
    path: 'watermark.text.fontSize',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.text.fontFamily(),
    path: 'watermark.text.fontFamily',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.text.color(),
    path: 'watermark.text.color',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.opacity(),
    path: 'watermark.opacity',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.rotate(),
    path: 'watermark.rotate',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.x(),
    path: 'watermark.x',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.y(),
    path: 'watermark.y',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.image.src.label(),
    path: 'watermark.image.src',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.width(),
    path: 'watermark.width',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.height(),
    path: 'watermark.height',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.opacity(),
    path: 'watermark.opacity',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.rotate(),
    path: 'watermark.rotate',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.x(),
    path: 'watermark.x',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.y(),
    path: 'watermark.y',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.metadata.label(),
    path: 'showMetadata',
    type: 'boolean',
  },
  {
    label: L.setting.format.title(),
    path: 'format',
    type: 'select',
    options: ([
      { text: L.setting.format.png0(), value: 'png0' },
      { text: L.setting.format.png1(), value: 'png1' },
      { text: L.setting.format.jpg(), value: 'jpg' },
      { text: '.webp', value: 'webp' },
      { text: L.setting.format.pdf(), value: 'pdf' },
    ] satisfies Array<{ text: string; value: FileFormat }>).filter(({ value }) => availableFormats.includes(value)),
  },
];

interface Props {
  settings: ISettings;
  app: App;
  markdownEl: HTMLElement;
  frontmatter: FrontMatterCache | undefined;
  metadataMap: Record<string, { type: MetadataType }>;
  title: string;
}

const ModalContent: FC<Props> = ({ markdownEl, settings, frontmatter, metadataMap, title, app }) => {
  const [formData, setFormData] = useState<ISettings>(settings);
  const [availableFormats, setAvailableFormats] = useState<FileFormat[]>(formatAvailable);

  useEffect(() => {
    let cancelled = false;
    getAvailableFormats().then((formats) => {
      if (!cancelled) {
        setAvailableFormats([...formats]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdate = useCallback((newData: ISettings) => {
    if (newData.padding?.unified !== false && newData.padding) {
      const oldTop = formData.padding?.top;
      const newTop = newData.padding.top;
      if (newTop !== undefined && newTop !== oldTop) {
        newData.padding.right = newTop;
        newData.padding.bottom = newTop;
        newData.padding.left = newTop;
      }
    }
    setFormData(newData);
  }, [formData]);

  const root = useRef<TargetRef>(null);
  const [mainHeight, setMainHeight] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const previewOutRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateHeight = () => {
      const height = document.querySelector('.modal-container')?.clientHeight;
      if (height) {
        setMainHeight(height - 160);
      }
    };

    // 初始计算
    calculateHeight();

    // 监听窗口大小变化
    window.addEventListener('resize', calculateHeight);

    // 监听内容加载事件
    const handleContentLoaded = () => {
      // 给一个小延迟确保内容完全加载
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    };

    window.document.addEventListener("export-image-content-loaded", handleContentLoaded);

    // 也检查markdownEl是否已准备好
    if (markdownEl && markdownEl instanceof HTMLElement && markdownEl.innerHTML && markdownEl.innerHTML.length > 0) {
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }

    return () => {
      window.removeEventListener('resize', calculateHeight);
      window.document.removeEventListener("export-image-content-loaded", handleContentLoaded);
    };
  }, []);

  useEffect(() => {
    // 当markdownEl准备好时，更新loading状态
    if (markdownEl && markdownEl instanceof HTMLElement && markdownEl.innerHTML && markdownEl.innerHTML.length > 0) {
      // 给一个小延迟确保内容完全加载
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
    
    // 监听内容加载完成事件
    const handleContentLoaded = () => {
      setIsLoading(false);
    };
    
    window.document.addEventListener("export-image-content-loaded", handleContentLoaded);
    
    return () => {
      window.document.removeEventListener("export-image-content-loaded", handleContentLoaded);
    };
  }, [markdownEl]);

  const [processing, setProcessing] = useState(false);
  const [allowCopy, setAllowCopy] = useState(true);
  const [rootHeight, setRootHeight] = useState(0);
  const [pages, setPages] = useState(1);
  const [scale, setScale] = useState(1);

  const calculateScale = useCallback(() => {
    if (!root.current?.element || !previewOutRef.current) return 1;
    const contentHeight = root.current.element.clientHeight;
    const contentWidth = root.current.element.clientWidth;
    const previewWidth = previewOutRef.current.clientWidth;

    return Math.min(
      1,
      mainHeight / (contentHeight || 100),
      previewWidth / ((contentWidth || 0) + 2),
    ) / 2;
  }, [mainHeight]);

  useEffect(() => {
    if (!root.current?.element || processing) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (root.current?.element) {
        if (!processing) {
          setRootHeight(root.current.element.clientHeight);
        }
      }
    });
    observer.observe(root.current.element);
    return () => {
      observer.disconnect();
    };
  }, [root.current?.element, processing]);

  const handleSplitChange = useCallback((positions: number[]) => {
    setPages(positions.length + 1);
  }, []);

  useEffect(() => {
    if (formData.split.mode === 'none') {
      setPages(1);
    }
  }, [formData.split.mode]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    isCopiable(formData.format).then(result => {
      setAllowCopy(Boolean(result));
    });
  }, [formData.format]);

  const handleSave = useCallback(async () => {
    if ((formData.width || 640) <= 20) {
      new Notice(L.invalidWidth());
      return;
    }
    if (!root.current) return;

    setProcessing(true);
    try {
      await save(
        app,
        root.current.contentElement,
        title,
        formData.resolutionMode,
        formData.format,
        Platform.isMobile,
      );
    } catch {
      new Notice(L.saveFail());
    }
    setProcessing(false);
  }, [root, formData.resolutionMode, formData.format, title, formData.width]);
  const handleCopy = useCallback(async () => {
    if ((formData.width || 640) <= 20) {
      new Notice(L.invalidWidth());
      return;
    }
    if (!root.current) return;

    setProcessing(true);
    try {
      await copy(root.current.contentElement, formData.resolutionMode, formData.format);
    } catch {
      new Notice(L.copyFail());
    }

    setProcessing(false);
  }, [root, formData.resolutionMode, formData.format, title, formData.width]);

  const handleSaveAll = useCallback(async () => {
    if ((formData.width || 640) <= 20) {
      new Notice(L.invalidWidth());
      return;
    }
    if (!root.current) return;

    setProcessing(true);
    try {
      await saveAll(
        root.current,
        formData.format,
        formData.resolutionMode,
        formData.split.height,
        formData.split.overlap,
        formData.split.mode,
        app,
        title,
      );
    } catch {
      new Notice(L.copyFail());
    }
    setProcessing(false);
  }, [root, formData.format, formData.resolutionMode, formData.split, app, title]);

  return (
    <div className='export-image-preview-root'>
      <div className='export-image-preview-main'>
        <div className='export-image-preview-left'>
          <div
            className='export-image-preview-out'
            ref={previewOutRef}
            style={{
              height: mainHeight,
              cursor: isGrabbing ? 'grabbing' : 'grab',
            }}
          >
            {isLoading ? (
              <div className="export-image-loading">
                <div className="export-image-loading-spinner"></div>
                <div className="export-image-loading-text">{L.loading()}</div>
              </div>
            ) : (
              <TransformWrapper
                minScale={calculateScale()}
                maxScale={4}
                pinch={{ step: 20 }}
                doubleClick={{ mode: 'reset' }}
                centerZoomedOut={false}
                onPanning={() => {
                  setIsGrabbing(true);
                }}
                onPanningStop={() => {
                  setIsGrabbing(false);
                }}
                onTransformed={(e) => {
                  setScale(e.state.scale);
                }}
                initialScale={1}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: mainHeight,
                  }}
                  contentStyle={{
                    border: '1px var(--divider-color) solid',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 0 10px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  <Target
                    ref={root}
                    frontmatter={frontmatter}
                    markdownEl={markdownEl}
                    setting={formData}
                    metadataMap={metadataMap}
                    app={app}
                    title={title}
                    scale={scale}
                    isProcessing={processing}
                    onSplitChange={handleSplitChange}
                  ></Target>
                </TransformComponent>
              </TransformWrapper>
            )}
          </div>
          <div className='info-text'>{L.guide()}</div>
        </div>
        <div className='export-image-preview-right'>
          <FormItems
            formSchema={getFormSchema(formData, availableFormats)}
            update={handleUpdate}
            settings={formData}
            app={app}
          />
          {formData.split.mode !== 'none' && formData.split.mode !== 'hr' && <div className='info-text'>
            {L.splitInfo({ rootHeight, splitHeight: formData.split.height, pages })}
          </div>}
          {formData.split.mode === 'hr' && <div className='info-text'>
            {L.splitInfoHr({ rootHeight, pages })}
          </div>}
          <div className='info-text'>{L.moreSetting()}</div>
        </div>
      </div>
      <div className='export-image-preview-actions'>
        {pages === 1 && (
          <div>
            <button onClick={handleCopy} disabled={processing || !allowCopy || isLoading}>
              {L.copy()}
            </button>
            {allowCopy || <p>{L.notAllowCopy({ format: formData.format.replace(/\d$/, '').toUpperCase() })}</p>}
          </div>
        )}

        <button onClick={() => pages === 1 ? handleSave() : handleSaveAll()} disabled={processing || isLoading}>
          {Platform.isMobile ? L.saveVault() : L.save()}
        </button>
      </div>
    </div>
  );
};

export default ModalContent;
