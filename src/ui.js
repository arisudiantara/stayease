// Helper UI: format Rupiah, navigasi antar tampilan, dan render katalog dasar.

import { KAMAR_CONTOH } from './products.js';

const formatterRupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export function formatRupiah(nilai) {
  return formatterRupiah.format(Number(nilai) || 0).replace(/\s/g, '');
}

export function initNavigasi() {
  const tautan = document.querySelectorAll('[data-view-link]');
  const tampilan = {
    katalog: document.getElementById('view-katalog'),
    dashboard: document.getElementById('view-dashboard'),
  };

  function tampilkan(nama) {
    Object.entries(tampilan).forEach(([kunci, section]) => {
      if (!section) return;
      section.hidden = kunci !== nama;
    });

    tautan.forEach((el) => {
      const aktif = el.dataset.viewLink === nama;
      if (aktif) {
        el.setAttribute('aria-current', 'page');
      } else {
        el.removeAttribute('aria-current');
      }
    });
  }

  tautan.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      tampilkan(el.dataset.viewLink);
    });
  });

  tampilkan('katalog');
}

// Placeholder render katalog — diisi pada milestone UI katalog.
export function renderKatalog(kamar = KAMAR_CONTOH) {
  const section = document.getElementById('view-katalog');
  if (!section) return;
  section.dataset.jumlahKamar = String(kamar.length);
}
