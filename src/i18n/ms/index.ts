 
import type { BaseTranslation } from '../i18n-types';

const ms = {
  command: 'Eksport sebagai imej',
  noActiveFile: 'Sila buka artikel terlebih dahulu!',
  imageExportPreview: 'Pratonton Eksport Imej',
  copiedSuccess: 'Disalin ke papan keratan',
  copy: 'Salin ke Papan Keratan',
  copyFail: 'Gagal menyalin',
  notAllowCopy: 'Tidak boleh menyalin format {format} secara langsung',
  save: 'Simpan Imej',
  saveSuccess: 'Imej telah dieksport dan disimpan sebagai {filePath: string}.',
  saveFail: 'Gagal menyimpan imej',
  saveVault: 'Simpan ke Vault',
  includingFilename: 'Termasuk Nama Fail Sebagai Tajuk',
  imageWidth: 'Lebar Imej',
  exportImage: 'Eksport sebagai imej',
  exportSelectionImage: 'Eksport pilihan sebagai imej',
  exportFolder: 'Eksport semua nota sebagai imej',
  invalidWidth: 'Sila tetapkan lebar dengan angka yang munasabah.',
  resolutionMode: 'Resolution scaling',
  moreSetting:
    'Seting lebih terperinci boleh didapati dalam tetapan plugin `Eksport Imej`.',
  guide: 'Seret untuk Bergerak, gulir atau cubit untuk zoom masuk/keluar, klik dua kali untuk menetapkan semula.',
  copyNotAllowed: 'format pdf tidak disokong untuk disalin',
  exportAll: 'Eksport Nota Terpilih',
  noMarkdownFile: 'Tiada fail markdown dalam direktori semasa',
  selectAll: 'Pilih Semua',
  setting: {
    title: 'Eksport Imej',
    imageWidth: {
      label: 'Lebar Imej Eksport Lalai',
      description:
        'Tetapkan lebar imej yang dieksport dalam piksel. Lalai adalah 640px.',
    },
    split: {
      title: 'Eksport Imej',
      mode: {
        label: 'Mode Pembahagian',
        description: 'Pilih cara untuk membahagikan gambar, dan cara untuk membahagikan gambar. Tinggi tetap berarti setiap halaman yang dibahagikan memiliki tinggi yang tetap, yang mungkin memotong teks pada titik pembahagian. Pembahagian garis mendatar berarti gambar dibahagikan sepanjang garis mendatar dalam dokumen. Pembahagian paragraf berarti gambar dibahagikan sepanjang paragraf untuk menghindari pembahagian paragraf menjadi dua gambar dan mempertahankan tinggi yang paling dekat dengan tinggi pembahagian.',
        none: 'Tiada Pembahagian',
        fixed: 'Tinggi Tetap',
        hr: 'Pembahagian Garis Mendatar',
        auto: 'Pembahagian Paragraf',
      },
      height: {
        label: 'Tinggi Halaman',
        description: 'Tetapkan tinggi setiap halaman yang dibahagikan dalam piksel. Lalai adalah 1000px.',
      },
      overlap: {
        label: 'Overlapping',
        description: 'Sett overlapp mellom sider for å unngå brutt innhold. Standard er 40px.',
      },
    },
    filename: {
      label: 'Termasuk Nama Fail Sebagai Tajuk',
      description:
        'Tetapkan sama ada untuk menyertakan nama fail sebagai tajuk. Apabila Obsidian memaparkan dokumen, ia akan menunjukkan nama fail sebagai tajuk h1. Kadangkala ini bukan apa yang anda mahu, dan anda akan mendapatkan tajuk berganda.',
    },
    resolutionMode: {
      label: 'Resolution scaling',
      description:
        'Render the exported image at a multiple of the set width. 1x is the original size with the smallest file, suitable for web and standard displays. 2x works well for Retina displays and social media. 3x is ideal for high-PPI mobile screens. 4x is best for printing or scenarios requiring heavy zoom. Higher multipliers produce sharper images but larger files.',
    },
    metadata: {
      label: 'Papar Metadata',
    },
    format: {
      title: 'Format Fail Output',
      description:
        'Imej format PNG lalai seharusnya memenuhi kebanyakan keperluan, tetapi untuk menyokong skenario pengguna lebih baik: 1. Sokongan untuk mengeksport imej dengan latar belakang normal dan telus; 2. Sokongan untuk mengeksport imej JPG untuk mencapai saiz fail yang lebih kecil, walaupun mungkin tidak dapat disalin langsung ke papan keratan; 3. Sokongan untuk mengeksport ke format PDF satu halaman, yang berbeza dari format kertas PDF biasa, sila berhati-hati untuk tidak salah guna.',
      png0: '.png - lalai',
      png1: '.png - imej dengan latar belakang telus',
      jpg: '.jpg - imej format jpg',
      pdf: '.pdf - PDF satu halaman',
    },
    quickExportSelection: {
      label: 'Eksport cepat',
      description: 'Jika diaktifkan, proses konfigurasi akan diabaikan saat mengekspor catatan yang dipilih, dan gambar yang diekspor akan langsung disalin ke clipboard.',
    },
    userInfo: {
      title: 'Info Penulis',
      show: 'Papar Info Penulis',
      avatar: {
        title: 'Avatar',
        description: 'Menggunakan gambar persegi disarankan',
      },
      name: 'Nama Penulis',
      position: 'Di mana untuk dipaparkan',
      remark: 'Teks tambahan',
      align: 'Menyelaraskan',
      alignOptions: {
        left: 'Left',
        center: 'Center',
        right: 'Right',
      },
      removeAvatar: 'Buang Avatar',
    },
    watermark: {
      title: 'Watermark',
      enable: {
        label: 'Aktifkan watermark',
        description:
          'Aktifkan watermark, menyokong watermark teks dan imej.',
      },
      type: {
        label: 'Jenis Watermark',
        description: 'Tetapkan jenis watermark, teks atau imej.',
        text: 'Teks',
        image: 'Imej',
      },
      text: {
        content: 'Kandungan Teks',
        fontSize: 'Saiz Fon Watermark',
        color: 'Warna Teks Watermark',
        fontFamily: 'Font Family',
      },
      image: {
        src: {
          label: 'URL Imej',
          upload: 'Muat Naik Imej',
          select: 'Pilih dari Vault',
        },
      },
      opacity: 'Ketelapan Watermark (0 telus, 1 tidak telus)',
      rotate: 'Putaran Watermark (dalam darjah)',
      width: 'Lebar Watermark',
      height: 'Tinggi Watermark',
      x: 'Jarak mendatar Watermark',
      y: 'Jarak menegak Watermark',
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
    preview: 'Pratonton Watermark',
    reset: 'Tetapkan Semula ke Lalai',
    recursive: 'Masukkan nota dari subdirektori',
  },
  imageSelect: {
    search: 'Cari',
    select: 'Pilih',
    cancel: 'Batal',
    empty: 'Tiada imej ditemui',
  },
  confirm: 'Konfirmasi',
  cancel: 'Batal',
  imageUrl: 'URL gambar',
  splitInfo: 'Tinggi gambar keseluruhan adalah {rootHeight}px, dan tinggi pemotongan adalah {splitHeight}px, jadi akan dihasilkan {pages} gambar',
  splitInfoHr: 'Tinggi gambar keseluruhan adalah {rootHeight}px, dan tinggi pemotongan adalah {splitHeight}px, jadi akan dihasilkan {pages} gambar',
} satisfies BaseTranslation;

export default ms;
