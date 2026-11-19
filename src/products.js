// Konstanta konfigurasi dan data kamar contoh (sumber: SPEC.md §4.3).

export const STORAGE_KEY = 'stayease.kamar.v1';
export const DATA_VERSION = 1;

export const TIPE_KAMAR = ['Standard', 'Deluxe', 'Family'];

// Placeholder — ganti dengan nomor WhatsApp pengelola yang sebenarnya.
// Format: kode negara tanpa tanda "+" atau spasi, mis. "6281200000000".
export const NOMOR_WHATSAPP = '6281200000000';

export const BATAS = {
  nama: 60,
  deskripsi: 300,
  kapasitasMaks: 10,
};

export const KAMAR_CONTOH = [
  {
    id: 'kamar-001',
    nama: 'Kamar Melati',
    tipe: 'Standard',
    harga: 250000,
    kapasitas: 2,
    deskripsi: 'Kamar standard dengan kasur double dan kipas angin.',
    imageUrl: '/images/kamar-1.svg',
    tersedia: true,
  },
  {
    id: 'kamar-002',
    nama: 'Kamar Anggrek',
    tipe: 'Standard',
    harga: 275000,
    kapasitas: 2,
    deskripsi: 'Kamar standard dengan kamar mandi dalam dan air panas.',
    imageUrl: '/images/kamar-2.svg',
    tersedia: false,
  },
  {
    id: 'kamar-003',
    nama: 'Kamar Kenanga',
    tipe: 'Deluxe',
    harga: 400000,
    kapasitas: 2,
    deskripsi: 'Kamar deluxe dengan AC dan jendela menghadap taman.',
    imageUrl: '/images/kamar-3.svg',
    tersedia: true,
  },
  {
    id: 'kamar-004',
    nama: 'Kamar Cempaka',
    tipe: 'Deluxe',
    harga: 450000,
    kapasitas: 3,
    deskripsi: 'Kamar deluxe luas dengan sofa kecil dan balkon.',
    imageUrl: '/images/kamar-4.svg',
    tersedia: true,
  },
  {
    id: 'kamar-005',
    nama: 'Kamar Bougenville',
    tipe: 'Family',
    harga: 650000,
    kapasitas: 4,
    deskripsi: 'Kamar keluarga dengan dua tempat tidur dan ruang duduk.',
    imageUrl: '/images/kamar-5.svg',
    tersedia: false,
  },
  {
    id: 'kamar-006',
    nama: 'Kamar Teratai',
    tipe: 'Family',
    harga: 700000,
    kapasitas: 5,
    deskripsi: 'Kamar keluarga terbesar dengan teras pribadi.',
    imageUrl: '/images/kamar-6.svg',
    tersedia: true,
  },
];
