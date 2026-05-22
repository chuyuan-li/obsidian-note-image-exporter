# Note Image Exporter

[English](README.md) | 中文

将 Obsidian 笔记、选中文本和文件夹导出为便于分享的图片或 PDF，并支持实时预览、长图拆分、水印和作者信息。

<img src="docs/readme/Note_Image_Exporter_Demo.png" width="650" alt="导出后的 Obsidian 笔记，包含 Mermaid、数学公式、代码、水印和作者信息">

Note Image Exporter 会尽量保留 Obsidian 的渲染结果，因此导出的图片可以包含 Mermaid 图表、数学公式、代码块、Callout、元数据和当前笔记样式。

## 快速开始

1. 右键点击笔记、选中文本或文件夹。
2. 选择 **Export to image**、**Export selection to image** 或 **Export all notes to image**。
3. 在预览中调整效果，然后复制结果或保存为文件。

<img src="docs/readme/export-preview.png" width="800" alt="图片导出预览和导出设置">

## 功能

- 将笔记导出为 PNG、JPG、WebP 或 PDF。
- 在格式支持时，直接从导出预览复制图片。
- 导出前实时预览宽度、内边距、格式、分辨率、水印和作者信息等效果。
- 使用固定高度、水平分割线或按段落自动拆分长笔记。
- 为分享图片添加文本水印或图片水印。
- 在导出图片像素中嵌入隐藏资产标识**(隐水印)**，便于后续匹配。
- 在导出图片中添加作者名、附加文本、头像，并设置对齐方式和显示位置。
- 从文件菜单批量导出文件夹中的 Markdown 笔记。
- 使用插件提供的 20 种界面语言。

## 使用方式

### 导出笔记

- 在文件列表中右键点击 Markdown 文件，选择 **Export to image**。
- 在编辑器中右键，选择 **Export to image**。
- 打开命令面板，运行 **Export as an image**。

## 平台说明

- 在桌面端，保存的导出结果会作为文件下载。
- 在移动端，保存的导出结果会写入当前 vault。
- 是否支持复制到剪贴板取决于输出格式和平台；无法复制时请保存文件。

## 安装

### 社区插件

插件上架后，可在 Obsidian 社区插件中安装 **Note Image Exporter**。

### 手动安装

1. 从 release 下载 `main.js`、`manifest.json` 和 `styles.css`。
2. 将它们放入 `<Vault>/.obsidian/plugins/note-image-exporter/`。
3. 在 **Settings** -> **Community plugins** 中启用 **Note Image Exporter**。

## 隐私和网络请求

笔记内容会在本地渲染并导出。插件不会将笔记内容发送到服务端。

只有当你为导出资源提供远程图片 URL 时，插件才会读取该远程图片，例如图片水印或头像。如果不希望导出时读取远程图片，请使用 vault 中的本地图片或上传的图片。

## 开发

```bash
npm install
npm run dev
npm run build
npm run typesafe-i18n
```

## 作者

由 [chuyuan-li](https://github.com/chuyuan-li) 创建。

## 许可证

MIT
