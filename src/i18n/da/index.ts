 
import type { BaseTranslation } from '../i18n-types';

const da = {
  // TODO: Indsæt dine oversættelser her
  command: 'Eksporter som billede',
  noActiveFile: 'Åbn venligst en artikel først!',
  imageExportPreview: 'Forhåndsvisning af billedexport',
  copiedSuccess: 'Kopieret til udklipsholderen',
  copy: 'Kopier til udklipsholderen',
  copyFail: 'Kunne ikke kopiere',
  notAllowCopy: 'Kan ikke kopiere {format} formatet direkte',
  save: 'Gem billede',
  saveSuccess: 'Billedet er eksporteret og gemt som {filePath: string}.',
  saveFail: 'Kunne ikke gemme billedet',
  saveVault: 'Gem i boksen',
  includingFilename: 'Inkluder filnavn som titel',
  imageWidth: 'Billedbredde',
  exportImage: 'Eksportér til billede',
  exportSelectionImage: 'Eksportér valg til billede',
  exportFolder: 'Eksportér alle noter til billeder',
  invalidWidth: 'Angiv venligst en bredde som et rimeligt tal.',
  resolutionMode: 'Resolution scaling',
  moreSetting:
    'Flere detaljerede indstillinger kan findes i `Eksportér billede` plugin-indstillingerne.',
  guide: 'Træk for at flytte, scroll eller knib for at zoome ind/ud, dobbeltklik for at nulstille.',
  copyNotAllowed: 'pdf formatet understøttes ikke til kopiering',
  exportAll: 'Eksportér udvalgte noter',
  noMarkdownFile: 'Ingen markdown filer i den aktuelle mappe',
  selectAll: 'Vælg alle',
  setting: {
    title: 'Eksportér billede',
    imageWidth: {
      label: 'Standard eksportbilledbredde',
      description:
        'Indstil bredden af det eksporterede billede i pixels. Standarden er 750px.',
    },
    split: {
      title: 'Del billede',
      mode: {
        label: 'Delingsmetode',
        description: 'Vælg, hvordan du vil dele billedet, og hvordan du vil dele det. Fast højde betyder, at hver delt side har en fast højde, hvilket kan skære teksten af i delingsstederne. Del efter vandret linje betyder, at billedet deles efter vandrette linjer i dokumentet. Del efter afsnit betyder, at billedet deles efter afsnit, hvilket sikrer, at et afsnit ikke deles i to billeder, og højden er så tæt som muligt til delingshøjden.',
        none: 'Ingen deling',
        fixed: 'Fast højde',
        hr: 'Vandret linje',
        auto: 'Afsnit',
      },
      height: {
        label: 'Sidehøjde',
        description: 'Indstiller højden af hver delt side i pixels. Standard er 1000px.',
      },
      overlap: {
        label: 'Overlap',
        description: 'Indstiller overlappet mellem sider for at undgå brat afbrydelse af indhold. Standard er 80px.',
      },
    },
    filename: {
      label: 'Inkluder filnavn som titel',
      description:
        'Indstil om filnavnet skal inkluderes som titel. Når Obsidian viser dokumentet, vises filnavnet som en h1 titel. Nogle gange er dette ikke ønsket, og du vil få dobbelte titler.',
    },
    resolutionMode: {
      label: 'Resolution scaling',
      description:
        'Render the exported image at a multiple of the set width. 1x is the original size with the smallest file, suitable for web and standard displays. 2x works well for Retina displays and social media. 3x is ideal for high-PPI mobile screens. 4x is best for printing or scenarios requiring heavy zoom. Higher multipliers produce sharper images but larger files.',
    },
    metadata: {
      label: 'Vis metadata',
    },
    format: {
      title: 'Output filformat',
      description:
        'Standard PNG format billeder bør opfylde de fleste behov, men for bedre at understøtte brugerscenarier: 1. Support for eksport af billeder med både normal og gennemsigtig baggrund; 2. Support for eksport af JPG billeder for at opnå mindre filstørrelser, selvom det muligvis ikke kan kopieres direkte til udklipsholderen; 3. Support for eksport til enkeltside PDF format, som adskiller sig fra de sædvanlige PDF-papirformater, vær venlig ikke at misbruge.',
      png0: '.png - standard',
      png1: '.png - billede med gennemsigtig baggrund',
      jpg: '.jpg - JPG format billede',
      pdf: '.pdf - enkeltside PDF',
    },
    quickExportSelection: {
      label: 'Hurtig eksport valgt',
      description: 'Hvis aktiveret, springes konfigurationsprocessen over, når du eksporterer valgte noter, og eksporteret billede kopieres direkte til udklipsholderen.',
    },
    userInfo: {
      title: 'Forfatterinfo',
      show: 'Vis forfatterinfo',
      avatar: {
        title: 'Avatar',
        description: 'Anbefales at bruge kvadratiske billeder',
      },
      name: 'Forfatternavn',
      position: 'Hvor skal det vises',
      remark: 'Ekstra tekst',
      align: 'Justér',
      alignOptions: {
        left: 'Left',
        center: 'Center',
        right: 'Right',
      },
      removeAvatar: 'Fjern avatar',
    },
    watermark: {
      title: 'Vandmærke',
      enable: {
        label: 'Aktivér vandmærke',
        description:
          'Aktiver vandmærke, understøtter tekst og billede vandmærker.',
      },
      type: {
        label: 'Vandmærke type',
        description: 'Indstil typen af vandmærke, tekst eller billede.',
        text: 'Tekst',
        image: 'Billede',
      },
      text: {
        content: 'Tekstindhold',
        fontSize: 'Vandmærke fontstørrelse',
        color: 'Vandmærketekstfarve',
        fontFamily: 'Font Family',
      },
      image: {
        src: {
          label: 'Billed-URL',
          upload: 'Upload billede',
          select: 'Vælg fra boks',
        },
      },
      opacity: 'Vandmærke opacitet (0 er gennemsigtig, 1 er ikke gennemsigtig)',
      rotate: 'Vandmærke rotation (i grader)',
      width: 'Vandmærke bredde',
      height: 'Vandmærke højde',
      x: 'Vandmærke horisontal afstand',
      y: 'Vandmærke vertikal afstand',
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
        description: 'Embed a short hidden asset mark into exported image pixels for later matching. It is not a substitute for source files or copyright records.',
      },
      ownerId: {
        label: 'Asset mark owner ID',
        description: 'Use a stable brand or account ID to make hidden asset marks easier to verify later.',
      },
    },
    preview: 'Vandmærke forhåndsvisning',
    reset: 'Nulstil til standard',
    recursive: 'Inkluder noter fra undermapper',
  },
  imageSelect: {
    search: 'Søg',
    select: 'Vælg',
    cancel: 'Annuller',
    empty: 'Ingen billeder fundet',
  },
  confirm: 'Bekræft',
  cancel: 'Annuller',
  imageUrl: 'Indtast URL',
  splitInfo: 'Den totale højde af billedet er {rootHeight}px, og delingshøjden er {splitHeight}px, så der vil blive genereret {pages} billeder',
  splitInfoHr: 'Den totale højde af billedet er {rootHeight}px, og delingshøjden er {splitHeight}px, så der vil blive genereret {pages} billeder',
} satisfies BaseTranslation;

export default da;
