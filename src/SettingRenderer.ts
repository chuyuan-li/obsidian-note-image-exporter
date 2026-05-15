import React, {
  useCallback,
  useState,
  type FC,
} from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { type App } from 'obsidian';
import type ExportImagePlugin from './ExportImagePlugin';
import type { SettingItem } from './formConfig';
import L from './L';
import FormItems from './components/common/form/FormItems';

const REPOSITORY = 'chuyuan-li/obsidian-image-share';
const REPOSITORY_URL = `https://github.com/${REPOSITORY}`;

const SettingsForm: FC<{
  app: App;
  plugin: ExportImagePlugin;
  formSchema: FormSchema<ISettings>;
}> = ({ app, plugin, formSchema }) => {
  const [settings, setSettings] = useState<ISettings>(plugin.settings);

  const handleUpdate = useCallback((newData: ISettings) => {
    if (newData.padding?.unified !== false && newData.padding) {
      const oldTop = settings.padding?.top;
      const newTop = newData.padding.top;
      if (newTop !== undefined && newTop !== oldTop) {
        newData.padding.right = newTop;
        newData.padding.bottom = newTop;
        newData.padding.left = newTop;
      }
    }

    plugin.settings = newData;
    setSettings({ ...newData });
    plugin.saveSettings().catch((error) => {
      console.error('Failed to save settings:', error);
    });
  }, [plugin, settings]);

  return (
    React.createElement(
      'div',
      { className: 'export-image-settings-form export-image-preview-right' },
      React.createElement(FormItems, {
        formSchema,
        settings,
        update: handleUpdate,
        app,
      }),
    )
  );
};

export class SettingRenderer {
  private app: App;
  private plugin: ExportImagePlugin;
  private containerEl: HTMLElement;
  private root: Root | undefined;

  constructor(app: App, plugin: ExportImagePlugin, containerEl: HTMLElement) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = containerEl;
  }

  async render(settingItems: SettingItem[] | undefined): Promise<void> {
    this.root?.unmount();
    this.containerEl.empty();
    this.containerEl.addClass('export-image-settings-root');

    this.containerEl.createEl('h3', { text: L.setting.title() });
    this.containerEl.createEl('p', {
      cls: 'export-image-settings-repo',
      text: 'GitHub: ',
    }).createEl('a', {
      text: REPOSITORY,
      attr: {
        href: REPOSITORY_URL,
        target: '_blank',
      },
    });

    const formRoot = this.containerEl.createDiv();
    this.root = createRoot(formRoot);
    this.root.render(
      React.createElement(SettingsForm, {
        app: this.app,
        plugin: this.plugin,
        formSchema: settingItems ?? [],
      }),
    );
  }
}
