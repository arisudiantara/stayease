import { describe, expect, it } from 'vitest';

import {
  buildWhatsAppUrl,
  filterRooms,
  validasiKamar,
} from '../src/logic.js';
import { KAMAR_CONTOH } from '../src/data.js';

// StayEase memakai entitas "kamar"; alias berikut menjaga nama fungsi
// yang diminta pada tugas pengujian.
const filterProducts = filterRooms;
const validateProduct = validasiKamar;

const salinKamar = () => KAMAR_CONTOH.map((kamar) => ({ ...kamar }));
const namaKamar = (daftar) => daftar.map((kamar) => kamar.nama);
const hargaKamar = (daftar) => daftar.map((kamar) => kamar.harga);

const kamarValid = (ubah = {}) => ({
  id: 'kamar-uji',
  nama: 'Kamar Uji',
  tipe: 'Standard',
  harga: 100000,
  kapasitas: 2,
  deskripsi: 'Kamar untuk pengujian.',
  imageUrl: '/images/placeholder.svg',
  tersedia: true,
  ...ubah,
});

describe('filterProducts (filterRooms)', () => {
  it('mengembalikan semua kamar dan tidak mengubah array masukan', () => {
    const asli = salinKamar();
    const hasil = filterProducts(asli, {});

    expect(hasil).toHaveLength(6);
    expect(hasil).not.toBe(asli);
    expect(asli).toEqual(KAMAR_CONTOH);
  });

  it('mencari nama secara case-insensitive', () => {
    expect(namaKamar(filterProducts(KAMAR_CONTOH, { query: 'melati' }))).toEqual([
      'Kamar Melati',
    ]);
    expect(namaKamar(filterProducts(KAMAR_CONTOH, { query: 'MELATI' }))).toEqual([
      'Kamar Melati',
    ]);
  });

  it('mencari pada tipe dan deskripsi', () => {
    expect(namaKamar(filterProducts(KAMAR_CONTOH, { query: 'family' }))).toEqual([
      'Kamar Bougenville',
      'Kamar Teratai',
    ]);
    expect(namaKamar(filterProducts(KAMAR_CONTOH, { query: 'kipas' }))).toEqual([
      'Kamar Melati',
    ]);
  });

  it('menggabungkan query, tipe, dan status dengan irisan AND', () => {
    const hasil = filterProducts(KAMAR_CONTOH, {
      query: 'teratai',
      tipe: 'Family',
      status: 'tersedia',
      urutan: 'default',
    });

    expect(namaKamar(hasil)).toEqual(['Kamar Teratai']);
  });

  it('menyaring tipe valid dan menolak kategori tidak valid', () => {
    expect(filterProducts(KAMAR_CONTOH, { tipe: 'Standard' })).toHaveLength(2);
    expect(filterProducts(KAMAR_CONTOH, { tipe: 'Deluxe' })).toHaveLength(2);
    expect(filterProducts(KAMAR_CONTOH, { tipe: 'Family' })).toHaveLength(2);
    expect(filterProducts(KAMAR_CONTOH, { tipe: 'Suite' })).toHaveLength(0);
  });

  it('menyaring status tersedia dan tidak tersedia', () => {
    expect(
      namaKamar(filterProducts(KAMAR_CONTOH, { status: 'tersedia' })),
    ).toEqual([
      'Kamar Melati',
      'Kamar Kenanga',
      'Kamar Cempaka',
      'Kamar Teratai',
    ]);
    expect(
      namaKamar(filterProducts(KAMAR_CONTOH, { status: 'tidak-tersedia' })),
    ).toEqual(['Kamar Anggrek', 'Kamar Bougenville']);
  });

  it('mengurutkan harga termurah dan termahal tanpa mengubah input', () => {
    const asli = salinKamar();

    expect(hargaKamar(filterProducts(asli, { urutan: 'termurah' }))).toEqual([
      250000, 275000, 400000, 450000, 650000, 700000,
    ]);
    expect(hargaKamar(filterProducts(asli, { urutan: 'termahal' }))).toEqual([
      700000, 650000, 450000, 400000, 275000, 250000,
    ]);
    expect(asli.map((kamar) => kamar.harga)).toEqual([
      250000, 275000, 400000, 450000, 650000, 700000,
    ]);
  });

  it('mengurutkan nama A–Z', () => {
    expect(
      namaKamar(filterProducts(KAMAR_CONTOH, { urutan: 'nama-az' })),
    ).toEqual([
      'Kamar Anggrek',
      'Kamar Bougenville',
      'Kamar Cempaka',
      'Kamar Kenanga',
      'Kamar Melati',
      'Kamar Teratai',
    ]);
  });

  it('mempertahankan urutan data pada urutan default', () => {
    expect(
      namaKamar(filterProducts(KAMAR_CONTOH, { urutan: 'default' })),
    ).toEqual(namaKamar(KAMAR_CONTOH));
  });

  it('menangani batas harga 0 saat sorting', () => {
    const daftar = [
      ...salinKamar(),
      kamarValid({ id: 'kamar-gratis', nama: 'Kamar Gratis', harga: 0 }),
    ];

    expect(hargaKamar(filterProducts(daftar, { urutan: 'termurah' }))[0]).toBe(0);
  });
});

describe('validateProduct (validasiKamar)', () => {
  it('menerima kamar valid dan menormalkan nama/deskripsi', () => {
    const hasil = validateProduct(
      kamarValid({ nama: '  Kamar Uji  ', deskripsi: '  Deskripsi  ' }),
    );

    expect(hasil.valid).toBe(true);
    expect(hasil.errors).toEqual({});
    expect(hasil.data.nama).toBe('Kamar Uji');
    expect(hasil.data.deskripsi).toBe('Deskripsi');
  });

  it('memvalidasi batas panjang nama', () => {
    expect(validateProduct(kamarValid({ nama: '' })).valid).toBe(false);
    expect(
      validateProduct(kamarValid({ nama: 'a'.repeat(61) })).errors.nama,
    ).toContain('1–60');
    expect(validateProduct(kamarValid({ nama: 'a'.repeat(60) })).valid).toBe(
      true,
    );
  });

  it('menolak tipe kamar di luar Standard/Deluxe/Family', () => {
    const hasil = validateProduct(kamarValid({ tipe: 'Suite' }));

    expect(hasil.valid).toBe(false);
    expect(hasil.errors.tipe).toContain('tipe kamar');
  });

  it('menangani batas harga: 0 valid, negatif/desimal/string invalid', () => {
    expect(validateProduct(kamarValid({ harga: 0 })).valid).toBe(true);
    expect(validateProduct(kamarValid({ harga: -1 })).valid).toBe(false);
    expect(validateProduct(kamarValid({ harga: 1.5 })).valid).toBe(false);
    expect(validateProduct(kamarValid({ harga: NaN })).valid).toBe(false);
    expect(validateProduct(kamarValid({ harga: '100000' })).valid).toBe(false);
  });

  it('menangani batas kapasitas 1–10', () => {
    expect(validateProduct(kamarValid({ kapasitas: 1 })).valid).toBe(true);
    expect(validateProduct(kamarValid({ kapasitas: 10 })).valid).toBe(true);
    expect(validateProduct(kamarValid({ kapasitas: 0 })).valid).toBe(false);
    expect(validateProduct(kamarValid({ kapasitas: 11 })).valid).toBe(false);
    expect(validateProduct(kamarValid({ kapasitas: 1.5 })).valid).toBe(false);
  });

  it('menolak deskripsi terlalu panjang dan status bukan boolean', () => {
    expect(
      validateProduct(kamarValid({ deskripsi: 'a'.repeat(301) })).valid,
    ).toBe(false);
    expect(
      validateProduct(kamarValid({ tersedia: 'true' })).errors.tersedia,
    ).toBeDefined();
  });

  it('mengizinkan gambar kosong dan menolak skema berbahaya', () => {
    expect(validateProduct(kamarValid({ imageUrl: '' })).valid).toBe(true);
    expect(
      validateProduct(kamarValid({ imageUrl: 'javascript:alert(1)' })).errors
        .imageUrl,
    ).toBeDefined();
    expect(
      validateProduct(kamarValid({ imageUrl: 'https://example.com/foto.jpg' }))
        .valid,
    ).toBe(true);
  });

  it('memvalidasi id bila field id disertakan', () => {
    expect(validateProduct(kamarValid({ id: '' })).errors.id).toBeDefined();

    const tanpaId = kamarValid();
    delete tanpaId.id;
    expect(validateProduct(tanpaId).valid).toBe(true);
  });
});

describe('buildWhatsAppUrl', () => {
  it('membangun URL wa.me dari nomor internasional dan pesan lengkap', () => {
    const url = buildWhatsAppUrl('+62 812-0000-0000', KAMAR_CONTOH[0]);
    const pesan = decodeURIComponent(url.split('?text=')[1]);

    expect(url).toMatch(/^https:\/\/wa\.me\/6281200000000\?text=/);
    expect(pesan).toContain('Kamar Melati');
    expect(pesan).toContain('Standard');
    expect(pesan).toContain('Rp250000 per malam');
    expect(pesan).toContain('2 tamu');
  });

  it('menormalkan spasi, tanda hubung, kurung, dan plus', () => {
    expect(buildWhatsAppUrl('+62 (812) 0000-0000', KAMAR_CONTOH[0])).toContain(
      'https://wa.me/6281200000000',
    );
  });

  it('menolak nomor kosong, bukan angka, dan diawali 0', () => {
    expect(buildWhatsAppUrl('', KAMAR_CONTOH[0])).toBeNull();
    expect(buildWhatsAppUrl('abc', KAMAR_CONTOH[0])).toBeNull();
    expect(buildWhatsAppUrl('0812-0000-0000', KAMAR_CONTOH[0])).toBeNull();
  });

  it('memvalidasi batas panjang nomor 8–15 digit', () => {
    expect(buildWhatsAppUrl('12345678', KAMAR_CONTOH[0])).not.toBeNull();
    expect(buildWhatsAppUrl('123456789012345', KAMAR_CONTOH[0])).not.toBeNull();
    expect(buildWhatsAppUrl('1234567', KAMAR_CONTOH[0])).toBeNull();
    expect(buildWhatsAppUrl('1234567890123456', KAMAR_CONTOH[0])).toBeNull();
  });

  it('meng-encode karakter khusus pada pesan', () => {
    const kamar = kamarValid({
      nama: 'Kamar A&B #1\nBaris dua',
      tipe: 'Deluxe',
      harga: 0,
      kapasitas: 10,
    });
    const url = buildWhatsAppUrl('+62 812 0000 0000', kamar);
    const pesan = decodeURIComponent(url.split('?text=')[1]);

    expect(url).not.toContain(' ');
    expect(url).not.toContain('\n');
    expect(pesan).toContain('Kamar A&B #1\nBaris dua');
    expect(pesan).toContain('Rp0 per malam');
  });
});
