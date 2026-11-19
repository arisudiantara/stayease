// Persistensi koleksi kamar di localStorage.

import { DATA_VERSION, KAMAR_CONTOH, STORAGE_KEY } from './data.js';
import { validasiKamar } from './logic.js';

const PESAN_RUSAK =
  'Data tersimpan tidak dapat dibaca. Data contoh dimuat.';

function salinDataContoh() {
  return KAMAR_CONTOH.map((kamar) => ({ ...kamar }));
}

function validasiPayload(payload) {
  if (
    !payload ||
    typeof payload !== 'object' ||
    payload.version !== DATA_VERSION ||
    !Array.isArray(payload.kamar)
  ) {
    return false;
  }

  const idTerpakai = new Set();

  for (const kamar of payload.kamar) {
    if (!kamar || typeof kamar !== 'object') return false;
    if (typeof kamar.id !== 'string' || kamar.id.trim() === '') return false;
    if (idTerpakai.has(kamar.id)) return false;

    const hasil = validasiKamar(kamar);
    if (!hasil.valid) return false;
    idTerpakai.add(kamar.id);
  }

  return true;
}

// Mengembalikan { kamar, error, perluSimpan }.
// perluSimpan true saat storage kosong/rusak agar data contoh langsung dipulihkan.
export function load() {
  try {
    const mentah = localStorage.getItem(STORAGE_KEY);
    if (mentah === null) {
      return { kamar: salinDataContoh(), error: null, perluSimpan: true };
    }

    let parsed;
    try {
      parsed = JSON.parse(mentah);
    } catch {
      return {
        kamar: salinDataContoh(),
        error: PESAN_RUSAK,
        perluSimpan: true,
      };
    }

    if (!validasiPayload(parsed)) {
      return {
        kamar: salinDataContoh(),
        error: PESAN_RUSAK,
        perluSimpan: true,
      };
    }

    return {
      kamar: parsed.kamar.map((kamar) => ({ ...kamar })),
      error: null,
      perluSimpan: false,
    };
  } catch {
    return {
      kamar: salinDataContoh(),
      error: PESAN_RUSAK,
      perluSimpan: true,
    };
  }
}

export function save(kamar) {
  const payload = { version: DATA_VERSION, kamar };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function reset() {
  const data = salinDataContoh();
  const saved = save(data);
  return { kamar: data, saved };
}
