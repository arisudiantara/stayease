// Persistensi koleksi kamar di localStorage.

import {
  DATA_VERSION,
  KAMAR_CONTOH,
  STORAGE_KEY,
} from './products.js';

function salinDataContoh() {
  return KAMAR_CONTOH.map((kamar) => ({ ...kamar }));
}

export function load() {
  try {
    const mentah = localStorage.getItem(STORAGE_KEY);
    if (!mentah) return salinDataContoh();

    const parsed = JSON.parse(mentah);
    if (!parsed || !Array.isArray(parsed.kamar)) return salinDataContoh();

    return parsed.kamar.map((kamar) => ({ ...kamar }));
  } catch {
    return salinDataContoh();
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
  save(data);
  return data;
}
