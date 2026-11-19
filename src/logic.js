// Fungsi murni: filter, validasi, dan pembentukan URL WhatsApp.

import { BATAS, TIPE_KAMAR } from './data.js';

// Filter kamar tanpa mengubah array masukan.
export function filterRooms(
  daftarKamar,
  { query = '', tipe = 'semua', status = 'semua', urutan = 'default' },
) {
  let hasil = daftarKamar.map((kamar) => ({ ...kamar }));

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    hasil = hasil.filter((kamar) => {
      const namaMatch = (kamar.nama || '').toLowerCase().includes(q);
      const tipeMatch = (kamar.tipe || '').toLowerCase().includes(q);
      const deskMatch = (kamar.deskripsi || '').toLowerCase().includes(q);
      return namaMatch || tipeMatch || deskMatch;
    });
  }

  if (tipe && tipe !== 'semua') {
    hasil = hasil.filter(
      (kamar) => (kamar.tipe || '').toLowerCase() === tipe.toLowerCase(),
    );
  }

  if (status && status !== 'semua') {
    const statusAktif = status === 'tersedia';
    hasil = hasil.filter((kamar) => kamar.tersedia === statusAktif);
  }

  const sorted = [...hasil];
  switch (urutan) {
    case 'termurah':
      sorted.sort((a, b) => Number(a.harga) - Number(b.harga));
      break;
    case 'termahal':
      sorted.sort((a, b) => Number(b.harga) - Number(a.harga));
      break;
    case 'nama-az':
      sorted.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
      break;
    default:
      break;
  }

  return sorted;
}

// Validasi data kamar. Mengembalikan daftar error dan data yang sudah dinormalisasi.
export function validasiKamar(input = {}) {
  const errors = {};

  const nama = typeof input.nama === 'string' ? input.nama.trim() : '';
  if (nama.length < 1 || nama.length > BATAS.nama) {
    errors.nama = `Nama wajib diisi, 1–${BATAS.nama} karakter.`;
  }

  const tipe = typeof input.tipe === 'string' ? input.tipe : '';
  if (!TIPE_KAMAR.includes(tipe)) {
    errors.tipe = 'Pilih tipe kamar yang tersedia.';
  }

  const harga = input.harga;
  if (
    typeof harga !== 'number' ||
    !Number.isInteger(harga) ||
    harga < 0
  ) {
    errors.harga = 'Harga harus bilangan bulat 0 atau lebih.';
  }

  const kapasitas = input.kapasitas;
  if (
    typeof kapasitas !== 'number' ||
    !Number.isInteger(kapasitas) ||
    kapasitas < 1 ||
    kapasitas > BATAS.kapasitasMaks
  ) {
    errors.kapasitas = `Kapasitas harus bilangan bulat 1–${BATAS.kapasitasMaks}.`;
  }

  const deskripsi =
    typeof input.deskripsi === 'string' ? input.deskripsi.trim() : '';
  if (deskripsi.length > BATAS.deskripsi) {
    errors.deskripsi = `Deskripsi maksimal ${BATAS.deskripsi} karakter.`;
  }

  const imageUrl =
    typeof input.imageUrl === 'string' ? input.imageUrl.trim() : '';
  const imageValid =
    imageUrl === '' ||
    imageUrl.startsWith('/images/') ||
    /^https?:\/\//.test(imageUrl);
  if (!imageValid) {
    errors.imageUrl =
      'Gunakan path /images/... atau URL http(s), atau kosongkan.';
  }

  if (typeof input.tersedia !== 'boolean') {
    errors.tersedia = 'Status ketersediaan tidak valid.';
  }

  if ('id' in input && (typeof input.id !== 'string' || input.id.trim() === '')) {
    errors.id = 'ID kamar tidak valid.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      nama,
      tipe,
      harga,
      kapasitas,
      deskripsi,
      imageUrl,
      tersedia: input.tersedia,
    },
  };
}

// Bangun URL wa.me; kembalikan null bila nomor tidak valid.
export function buildWhatsAppUrl(nomor, kamar) {
  const digit = String(nomor).replace(/\D/g, '');

  if (
    !digit ||
    digit.length < 8 ||
    digit.length > 15 ||
    digit.startsWith('0')
  ) {
    return null;
  }

  const nama = kamar.nama || '';
  const tipe = kamar.tipe || '';
  const harga = kamar.harga ?? 0;
  const kapasitas = kamar.kapasitas ?? '';

  const pesan = [
    'Halo, saya tertarik memesan kamar berikut:',
    `- Kamar: ${nama}`,
    `- Tipe: ${tipe}`,
    `- Harga: Rp${harga} per malam`,
    `- Kapasitas: ${kapasitas} tamu`,
    'Apakah kamar ini masih tersedia?',
  ].join('\n');

  return `https://wa.me/${digit}?text=${encodeURIComponent(pesan)}`;
}
