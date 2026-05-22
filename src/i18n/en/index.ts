 
import type { Translation } from '../i18n-types';

const en = {
  // TODO: your translations go here
  command: 'Export as an image',
  noActiveFile: 'Please open an article first!',
  imageExportPreview: 'Image Export Preview',
  copiedSuccess: 'Copied to clipboard',
  copy: 'Copy to Clipboard',
  copyFail: 'Failed to copy',
  notAllowCopy: 'Unable to directly copy {format} format',
  save: 'Save Image',
  saveSuccess: 'Export and save the image as {filePath}.',
  saveFail: 'Failed to save the image',
  saveVault: 'Save to Vault',
  includingFilename: 'Including File Name As Title',
  imageWidth: 'Image Width',
  exportImage: 'Export to image',
  exportSelectionImage: 'Export selection to image',
  exportFolder: 'Export all notes to image',
  loading: 'Loading document content...',
  invalidWidth: 'Please set width with a reasonable number.',
  resolutionMode: 'Resolution scaling',
  moreSetting:
    'More detailed settings can be found in the `Export Image` plugin settings.',
  guide: 'Drag to Move, scroll or pinch to zoom in/out, double click to reset.',
  copyNotAllowed: 'pdf format is not supported for copy',
  exportAll: 'Export Selected Notes',
  noMarkdownFile: 'No markdown files in the current directory',
  selectAll: 'Select All',
  setting: {
    title: 'Export Image',
    imageWidth: {
      label: 'Default exported image width',
      description:
        'Base width: Set the content width of the exported image. Captured pixels: Resolution scaling and device DPR increase the captured pixel width. Default: 750px.',
    },
    padding: {
      title: 'Image Padding',
      description: 'Padding: Set padding for the exported image. Default: 24px for all sides.',
      unified: 'Uniform padding',
      all: 'Padding',
      top: 'Top padding',
      right: 'Right padding',
      bottom: 'Bottom padding',
      left: 'Left padding',
    },
    split: {
      title: 'Split Image',
      mode: {
        label: 'Split mode',
        description: 'Split mode: Choose whether to split the image. Fixed height: Keep each split image at a fixed height, which may cut off text at the split point. Horizontal rule: Split at horizontal rules in the document. Auto by paragraph: Keep each paragraph on one image and stay as close as possible to the split height.',
        none: 'No split',
        fixed: 'Fixed height',
        hr: 'Split by horizontal rule',
        auto: 'Auto split by paragraph',
      },
      height: {
        label: 'Split image height',
        description: 'Split height: Set the height of each split image in pixels. Default: 1000px.',
      },
      overlap: {
        label: 'Split image overlap',
        description: 'Overlap: Set the overlap between adjacent split images to prevent content from being cut off. Default: 80px.',
      },
    },
    filename: {
      label: 'Include file name as title',
      description:
        'Set whether to include the file name as the title. When Obsidian displays the document, it will display the file name as an h1 title. Sometimes this is not what you want, and you will get duplicate titles.',
    },
    resolutionMode: {
      label: 'Resolution scaling',
      description: 'Scaling: Render the exported image at a multiple of the set width. 1x: Original size with the smallest file, suitable for web and standard displays. 2x: Works well for Retina displays and social media. 3x: Ideal for high-PPI mobile screens. 4x: Best for printing or scenarios requiring heavy zoom. Higher multipliers: Produce sharper images and larger files.',
    },
    metadata: {
      label: 'Show metadata',
    },
    format: {
      title: 'Output file format',
      description:
        'PNG: Covers most exports with a normal background. Transparent PNG: Exports images with a transparent background. JPG: Produces smaller files, but may not copy directly to the clipboard. PDF: Exports a single-page PDF rather than a paper-sized PDF.',
      png0: 'png - default',
      png1: 'png - export transparent background image',
      jpg: 'jpg - export jpg image',
      pdf: 'pdf - export single page pdf',
    },
    quickExportSelection: {
      label: 'Quick export selection',
      description: 'Whether to skip the configuration process when exporting selected content, directly copying the exported image to the clipboard.',
    },
    userInfo: {
      title: 'Author info',
      show: 'Show author info',
      avatar: {
        title: 'Avatar',
        description: 'Recommend using square pictures',
      },
      name: 'Author name',
      position: 'Display position',
      remark: 'Extra text',
      align: 'Alignment',
      alignOptions: {
        left: 'Left',
        center: 'Center',
        right: 'Right',
      },
      removeAvatar: 'Remove avatar',
    },
    watermark: {
      title: 'Watermark',
      enable: {
        label: 'Enable watermark',
        description:
          'Enable watermark, supporting text watermark and image watermark.',
      },
      type: {
        label: 'Watermark type',
        description: 'Set the type of watermark, text or image.',
        text: 'Text',
        image: 'Image',
      },
      text: {
        content: 'Watermark text content',
        fontSize: 'Watermark font size',
        color: 'Watermark text color',
        fontFamily: 'Font Family',
      },
      image: {
        src: {
          label: 'Image url',
          upload: 'Upload image',
          select: 'Select from current vault',
        },
      },
      opacity: 'Watermark opacity (0 is transparent, 1 is not transparent)',
      rotate: 'Watermark rotation (in degrees)',
      width: 'Watermark width',
      height: 'Watermark height',
      x: 'Watermark horizontal gap',
      y: 'Watermark vertical gap',
      position: {
        label: 'Position',
        topLeft: 'Top Left',
        topRight: 'Top Right',
        bottomLeft: 'Bottom Left',
        bottomRight: 'Bottom Right',
        center: 'Center',
      },
    },
    assetMark: {
      enable: {
        label: 'Embed hidden asset mark',
        description: 'Hidden mark: Embed a short asset mark into exported image pixels for later matching. Limitation: It is not a substitute for source files or copyright records.',
      },
      ownerId: {
        label: 'Asset mark owner ID',
        description: 'Use a stable brand or account ID to make hidden asset marks easier to verify later.',
      },
    },
    preview: 'Watermark effect preview',
    reset: 'Reset to default',
    recursive: 'Include notes from subdirectories',
  },
  imageSelect: {
    search: 'Search',
    select: 'Select',
    cancel: 'Cancel',
    empty: 'No image found',
  },
  confirm: 'Confirm',
  cancel: 'Cancel',
  imageUrl: 'Enter URL',
  splitInfo: 'The total height of the image is {rootHeight}px, and the split height is {splitHeight}px, so {pages} images will be generated',
  splitInfoHr: 'The total height of the image is {rootHeight}px, and the image will be split by the horizontal rule, so {pages} images will be generated',
} satisfies Translation;

export default en;
