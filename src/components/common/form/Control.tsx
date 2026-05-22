import React, { type FC, useEffect, useRef, useState } from 'react';
import { setIcon, type App, Modal } from 'obsidian';
import { fileToBase64 } from '../../../utils';
import { getSettingPath, setSettingPath } from '../../../utils/settingPath';
import L from '../../../L';
import ImageSelectModal from '../imageSelectModal';
import { getRemoteImageUrl } from 'src/utils/capture';

const Control: FC<{
  fieldSchema: FieldSchema<ISettings>;
  setting: ISettings;
  update: (settings: ISettings) => void;
  app: App;
}> = ({ fieldSchema, setting, update, app }) => {
  const value = getSettingPath(setting, fieldSchema.path);
  const [numberDraft, setNumberDraft] = useState<string | number | undefined>(
    value as string | number | undefined,
  );
  const [processedImageUrl, setProcessedImageUrl] = useState<string | undefined>(undefined);
  const inputReference = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const onChange = (value: SettingPathValue<ISettings, SettingPath<ISettings>>) => {
    const newSetting = structuredClone(setting);
    setSettingPath(newSetting, fieldSchema.path, value);
    update(newSetting);
  };

  useEffect(() => {
    if (fieldSchema.type === 'number') {
      setNumberDraft(value as string | number | undefined);
    }
  }, [fieldSchema.path, fieldSchema.type, value]);

  useEffect(() => {
    if (iconRef.current) {
      setIcon(iconRef.current, 'x');
    }
  }, [iconRef.current]);

  useEffect(() => {
    const processImage = async () => {
      if (fieldSchema.type === 'file' && typeof value === 'string') {
        const url = await getRemoteImageUrl(value);
        setProcessedImageUrl(url);
      } else {
        setProcessedImageUrl(value as string | undefined);
      }
    };
    void processImage();
  }, [value, fieldSchema.type]);

  const upload = async () => {
    const file = inputReference.current?.files?.[0];
    if (file) {
      onChange(await fileToBase64(file));
      inputReference.current.value = '';
    }
  };

  const select = () => {
    const modal = new ImageSelectModal(app, img => {
      onChange(img);
      modal.close();
    });
    modal.open();
  };

  switch (fieldSchema.type) {
    case 'number': {
      return (
        <input
          type='number'
          value={numberDraft ?? ''}
          onChange={e => {
            const rawValue = e.target.value;
            setNumberDraft(rawValue);
            if (rawValue === '') {
              return;
            }
            const nextValue = Number(rawValue);
            if (Number.isFinite(nextValue)) {
              onChange(nextValue);
            }
          }
          }
          onBlur={() => {
            if (numberDraft === '') {
              setNumberDraft(value as string | number | undefined);
            }
          }}
        />
      );
    }

    case 'string': {
      return (
        <input
          type='text'
          value={value as string | number | undefined}
          onChange={e => {
            onChange(e.target.value);
          }}
        />
      );
    }

    case 'boolean': {
      return (
        <div
          className={`checkbox-container${value ? ' is-enabled' : ''}`}
          onClick={() => {
            onChange(!getSettingPath(setting, fieldSchema.path));
          }}
        >
          <input type='checkbox' checked={Boolean(value)} />
        </div>
      );
    }

    case 'select': {
      return (
        <select
          value={value as string | number | undefined}
          onChange={e => {
            onChange(e.target.value);
          }}
          className='dropdown'
        >
          {fieldSchema.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      );
    }

    case 'file': {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              className='user-info-avatar'
              style={{
                position: 'relative',
                display: value ? 'block' : 'none',
              }}
            >
              {processedImageUrl && (
                <img
                  src={processedImageUrl}
                  alt="avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
              <div
                ref={iconRef}
                onClick={() => (onChange(undefined))}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'black',
                  color: 'white',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  '--icon-size': '12px',
                  '--icon-color': 'var(--color-red)',
                } as React.CSSProperties}
              ></div>
            </div>
            <button onClick={() => inputReference.current?.click()}>
              {L.setting.watermark.image.src.upload()}
              <input
                style={{ display: 'none' }}
                type='file'
                ref={inputReference}
                onChange={() => {
                  void upload();
                }}
              />
            </button>
            <button onClick={select}>
              {L.setting.watermark.image.src.select()}
            </button>
            <button onClick={() => {
              const modal = new Modal(app);
              modal.titleEl.setText(L.imageUrl());

              const inputContainer = modal.contentEl.createDiv({
                attr: {
                  style: 'margin: 1em 0;'
                }
              });
              const input = inputContainer.createEl('input', {
                attr: {
                  type: 'text',
                  placeholder: L.imageUrl(),
                  style: 'width: 100%'
                }
              });

              input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                  onChange(input.value);
                  modal.close();
                } else if (e.key === 'Escape') {
                  modal.close();
                }
              };

              const buttonDiv = modal.contentEl.createDiv({
                cls: 'modal-button-container',
                attr: {
                  style: 'display: flex; justify-content: flex-end; gap: 8px; margin-top: 1em;'
                }
              });

              const confirmButton = buttonDiv.createEl('button', {
                text: L.confirm(),
                cls: 'mod-cta'
              });
              confirmButton.onclick = () => {
                onChange(input.value);
                modal.close();
              };

              buttonDiv.createEl('button', { text: L.cancel() }).onclick = () => {
                modal.close();
              };

              modal.open();
              window.setTimeout(() => input.focus(), 0);
            }}>
              {L.imageUrl()}
            </button>
          </div>
        </div>
      );
    }
  }
};

export default Control;
