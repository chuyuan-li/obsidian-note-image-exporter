import type { App } from 'obsidian';
import L from 'src/L';
import { getAvailableFormats } from 'src/settings';
import { delay } from './utils';

export type SettingItem = FieldSchema<ISettings>;

export const createSettingConfig = async (app: App): Promise<FormSchema<ISettings>> => {
  await delay(50);
  const formatAvailable = await getAvailableFormats();

  return [
    {
      path: 'showFilename',
      label: L.setting.filename.label(),
      desc: L.setting.filename.description(),
      type: 'boolean',
    },
    {
      path: 'showMetadata',
      label: L.setting.metadata.label(),
      type: 'boolean',
    },
    {
      path: 'width',
      label: L.setting.imageWidth.label(),
      desc: L.setting.imageWidth.description(),
      type: 'number',
    },
    {
      path: 'padding.unified',
      label: L.setting.padding.unified(),
      desc: L.setting.padding.description(),
      type: 'boolean',
    },
    {
      path: 'padding.top',
      label: L.setting.padding.all(),
      type: 'number',
      when: { flag: true, path: 'padding.unified' },
    },
    {
      path: 'padding.top',
      label: L.setting.padding.top(),
      desc: L.setting.padding.description(),
      type: 'number',
      when: (settings) => settings.padding?.unified === false,
    },
    {
      path: 'padding.right',
      label: L.setting.padding.right(),
      type: 'number',
      when: (settings) => settings.padding?.unified === false,
    },
    {
      path: 'padding.bottom',
      label: L.setting.padding.bottom(),
      type: 'number',
      when: (settings) => settings.padding?.unified === false,
    },
    {
      path: 'padding.left',
      label: L.setting.padding.left(),
      type: 'number',
      when: (settings) => settings.padding?.unified === false,
    },
    {
      path: 'split.mode',
      label: L.setting.split.mode.label(),
      desc: L.setting.split.mode.description(),
      type: 'select',
      options: [
        { value: 'none', text: L.setting.split.mode.none() },
        { value: 'fixed', text: L.setting.split.mode.fixed() },
        { value: 'hr', text: L.setting.split.mode.hr() },
        { value: 'auto', text: L.setting.split.mode.auto() },
      ],
    },
    {
      path: 'split.height',
      label: L.setting.split.height.label(),
      desc: L.setting.split.height.description(),
      type: 'number',
      when: (settings) => settings.split.mode !== 'none' && settings.split.mode !== 'hr',
    },
    {
      path: 'split.overlap',
      label: L.setting.split.overlap.label(),
      desc: L.setting.split.overlap.description(),
      type: 'number',
      when: (settings) => settings.split.mode === 'fixed',
    },
    {
      path: 'resolutionMode',
      label: L.setting.resolutionMode.label(),
      desc: L.setting.resolutionMode.description(),
      type: 'select',
      options: [
        { value: '1x', text: '1x' },
        { value: '2x', text: '2x' },
        { value: '3x', text: '3x' },
        { value: '4x', text: '4x' },
      ],
    },
    {
      path: 'format',
      label: L.setting.format.title(),
      desc: L.setting.format.description(),
      type: 'select',
      options: ([
        { value: 'png0', text: L.setting.format.png0() },
        { value: 'png1', text: L.setting.format.png1() },
        { value: 'jpg', text: L.setting.format.jpg() },
        { value: 'webp', text: '.webp' },
        { value: 'pdf', text: L.setting.format.pdf() },
      ] satisfies Array<{ text: string; value: FileFormat }>).filter(({ value }) => formatAvailable.includes(value)),
    },
    {
      path: 'quickExportSelection',
      label: L.setting.quickExportSelection.label(),
      desc: L.setting.quickExportSelection.description(),
      type: 'boolean',
    },
    {
      path: 'authorInfo.show',
      label: L.setting.userInfo.show(),
      type: 'boolean',
    },
    {
      path: 'authorInfo.name',
      label: L.setting.userInfo.name(),
      type: 'string',
      when: { flag: true, path: 'authorInfo.show' },
    },
    {
      path: 'authorInfo.remark',
      label: L.setting.userInfo.remark(),
      type: 'string',
      when: { flag: true, path: 'authorInfo.show' },
    },
    {
      path: 'authorInfo.avatar',
      label: L.setting.userInfo.avatar.title(),
      desc: L.setting.userInfo.avatar.description(),
      type: 'file',
      when: { flag: true, path: 'authorInfo.show' },
    },
    {
      path: 'authorInfo.position',
      label: L.setting.userInfo.position(),
      type: 'select',
      options: [
        { value: 'top', text: 'Top' },
        { value: 'bottom', text: 'Bottom' },
      ],
      when: { flag: true, path: 'authorInfo.show' },
    },
    {
      path: 'authorInfo.align',
      label: L.setting.userInfo.align(),
      type: 'select',
      options: [
        { value: 'left', text: L.setting.userInfo.alignOptions.left() },
        { value: 'center', text: L.setting.userInfo.alignOptions.center() },
        { value: 'right', text: L.setting.userInfo.alignOptions.right() },
      ],
      when: { flag: true, path: 'authorInfo.show' },
    },
    {
      path: 'watermark.enable',
      label: L.setting.watermark.enable.label(),
      desc: L.setting.watermark.enable.description(),
      type: 'boolean',
    },
    {
      path: 'watermark.type',
      label: L.setting.watermark.type.label(),
      desc: L.setting.watermark.type.description(),
      type: 'select',
      options: [
        { value: 'text', text: L.setting.watermark.type.text() },
        { value: 'image', text: L.setting.watermark.type.image() },
      ],
      when: { flag: true, path: 'watermark.enable' },
    },
    {
      path: 'watermark.text.content',
      label: L.setting.watermark.text.content(),
      type: 'string',
      when: (settings) => settings.watermark.enable && settings.watermark.type === 'text',
    },
    {
      path: 'watermark.text.fontSize',
      label: L.setting.watermark.text.fontSize(),
      type: 'number',
      when: (settings) => settings.watermark.enable && settings.watermark.type === 'text',
    },
    {
      path: 'watermark.text.color',
      label: L.setting.watermark.text.color(),
      type: 'string',
      when: (settings) => settings.watermark.enable && settings.watermark.type === 'text',
    },
    {
      path: 'watermark.image.src',
      label: L.setting.watermark.image.src.label(),
      type: 'file',
      when: (settings) => settings.watermark.enable && settings.watermark.type === 'image',
    },
    {
      path: 'watermark.opacity',
      label: L.setting.watermark.opacity(),
      type: 'number',
      when: (settings) => settings.watermark.enable,
    },
    {
      path: 'watermark.rotate',
      label: L.setting.watermark.rotate(),
      type: 'number',
      when: (settings) => settings.watermark.enable,
    },
    {
      path: 'watermark.width',
      label: L.setting.watermark.width(),
      type: 'number',
      when: (settings) => settings.watermark.enable,
    },
    {
      path: 'watermark.height',
      label: L.setting.watermark.height(),
      type: 'number',
      when: (settings) => settings.watermark.enable,
    },
    {
      path: 'watermark.x',
      label: L.setting.watermark.x(),
      type: 'number',
      when: (settings) => settings.watermark.enable,
    },
    {
      path: 'watermark.y',
      label: L.setting.watermark.y(),
      type: 'number',
      when: (settings) => settings.watermark.enable,
    },
    {
      path: 'assetMark.enable',
      label: L.setting.assetMark.enable.label(),
      desc: L.setting.assetMark.enable.description(),
      type: 'boolean',
    },
    {
      path: 'assetMark.ownerId',
      label: L.setting.assetMark.ownerId.label(),
      desc: L.setting.assetMark.ownerId.description(),
      type: 'string',
      when: { flag: true, path: 'assetMark.enable' },
    },
  ];
};
