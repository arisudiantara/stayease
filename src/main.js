// Bootstrap aplikasi StayEase dan pengelola state tunggal kamar.

import './style.css';
import { load, reset, save } from './storage.js';
import {
  initDashboard,
  initKatalogControls,
  initNavigasi,
  renderSemua,
  tampilkanNotice,
  tampilkanStatus,
} from './render.js';

const hasilLoad = load();
let kamar = hasilLoad.kamar;

// Tulis data contoh bila storage kosong atau rusak.
if (hasilLoad.perluSimpan) save(kamar);

function simpanDanRender(daftarBaru, pesan) {
  kamar = daftarBaru;
  const tersimpan = save(kamar);
  renderSemua(kamar);

  if (pesan) tampilkanStatus(pesan);
  if (!tersimpan) {
    tampilkanNotice(
      'Perubahan tidak dapat disimpan di browser ini.',
      'error',
    );
  }
}

function resetDataDemo() {
  const hasil = reset();
  kamar = hasil.kamar;
  renderSemua(kamar);
  tampilkanStatus('Data demo dikembalikan.');

  if (!hasil.saved) {
    tampilkanNotice(
      'Perubahan tidak dapat disimpan di browser ini.',
      'error',
    );
  }
}

initNavigasi();
initKatalogControls();
initDashboard({
  getKamar: () => kamar,
  simpan: simpanDanRender,
  reset: resetDataDemo,
});

renderSemua(kamar);

if (hasilLoad.error) {
  tampilkanNotice(hasilLoad.error, 'warning');
}
