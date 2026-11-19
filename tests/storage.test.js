import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DATA_VERSION,
  KAMAR_CONTOH,
  STORAGE_KEY,
} from '../src/data.js';
import { load, reset, save } from '../src/storage.js';

let memori;

const payloadValid = () => ({
  version: DATA_VERSION,
  kamar: KAMAR_CONTOH.map((kamar) => ({ ...kamar })),
});

const tulisMentah = (nilai) => {
  memori.set(STORAGE_KEY, nilai);
};

const bacaTersimpan = () => JSON.parse(memori.get(STORAGE_KEY));

beforeEach(() => {
  memori = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => (memori.has(key) ? memori.get(key) : null),
    setItem: (key, value) => memori.set(key, String(value)),
    removeItem: (key) => memori.delete(key),
    clear: () => memori.clear(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parser localStorage (load)', () => {
  it('mengembalikan 6 data contoh saat storage kosong', () => {
    const hasil = load();

    expect(hasil.error).toBeNull();
    expect(hasil.perluSimpan).toBe(true);
    expect(hasil.kamar).toHaveLength(6);
    expect(hasil.kamar).not.toBe(KAMAR_CONTOH);
  });

  it('membaca payload valid dengan struktur yang benar', () => {
    tulisMentah(JSON.stringify(payloadValid()));

    const hasil = load();

    expect(hasil.error).toBeNull();
    expect(hasil.perluSimpan).toBe(false);
    expect(hasil.kamar).toHaveLength(6);
    expect(hasil.kamar[0]).toEqual(KAMAR_CONTOH[0]);
  });

  it('menerima imageUrl kosong sebagai nilai valid', () => {
    const payload = payloadValid();
    payload.kamar[0].imageUrl = '';
    tulisMentah(JSON.stringify(payload));

    expect(load().error).toBeNull();
  });

  it('memulihkan data contoh saat JSON rusak', () => {
    tulisMentah('{');

    const hasil = load();

    expect(hasil.kamar).toHaveLength(6);
    expect(hasil.perluSimpan).toBe(true);
    expect(hasil.error).toContain('Data tersimpan tidak dapat dibaca');
  });

  it('menolak version yang salah dan kamar bukan array', () => {
    tulisMentah(JSON.stringify({ version: 2, kamar: [] }));
    expect(load().error).toBeTruthy();

    tulisMentah(JSON.stringify({ version: 1, kamar: {} }));
    expect(load().error).toBeTruthy();
  });

  it('menolak field dengan tipe yang salah', () => {
    const payload = payloadValid();
    payload.kamar[0].harga = '250000';
    tulisMentah(JSON.stringify(payload));

    expect(load().error).toBeTruthy();
    expect(load().kamar).toHaveLength(6);
  });

  it('menolak tipe kamar, kapasitas, dan tersedia yang tidak valid', () => {
    const tipeSalah = payloadValid();
    tipeSalah.kamar[0].tipe = 'Suite';
    tulisMentah(JSON.stringify(tipeSalah));
    expect(load().error).toBeTruthy();

    const kapasitasSalah = payloadValid();
    kapasitasSalah.kamar[0].kapasitas = 0;
    tulisMentah(JSON.stringify(kapasitasSalah));
    expect(load().error).toBeTruthy();

    const tersediaSalah = payloadValid();
    tersediaSalah.kamar[0].tersedia = 'true';
    tulisMentah(JSON.stringify(tersediaSalah));
    expect(load().error).toBeTruthy();
  });

  it('menolak id duplikat', () => {
    const payload = payloadValid();
    payload.kamar[1].id = payload.kamar[0].id;
    tulisMentah(JSON.stringify(payload));

    expect(load().error).toBeTruthy();
  });
});

describe('penyimpanan localStorage (save/reset)', () => {
  it('menulis struktur { version: 1, kamar: [...] }', () => {
    expect(save(KAMAR_CONTOH)).toBe(true);

    const tersimpan = bacaTersimpan();
    expect(tersimpan.version).toBe(1);
    expect(tersimpan.kamar).toHaveLength(6);
    expect(tersimpan.kamar[0].nama).toBe('Kamar Melati');
  });

  it('mengembalikan false bila localStorage gagal ditulis', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {},
      clear: () => {},
    });

    expect(save(KAMAR_CONTOH)).toBe(false);
  });

  it('reset mengembalikan dan menyimpan 6 data contoh', () => {
    save([{ ...KAMAR_CONTOH[0], nama: 'Kamar Sementara' }]);

    const hasil = reset();

    expect(hasil.saved).toBe(true);
    expect(hasil.kamar).toHaveLength(6);
    expect(hasil.kamar[0].nama).toBe('Kamar Melati');
    expect(bacaTersimpan().kamar).toHaveLength(6);
  });
});
