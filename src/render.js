// Render katalog dan dashboard StayEase. Semua akses DOM berada di berkas ini.

import { NOMOR_WHATSAPP, TIPE_KAMAR } from './data.js';
import {
  buildWhatsAppUrl,
  filterRooms,
  validasiKamar,
} from './logic.js';

const formatterRupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

let kamarAktif = [];
const filter = {
  query: '',
  tipe: 'semua',
  status: 'semua',
  urutan: 'default',
};

export function formatRupiah(nilai) {
  return formatterRupiah.format(Number(nilai) || 0).replace(/\s/g, '');
}

function buatBadge(teks, kelas) {
  const badge = document.createElement('span');
  badge.className = `badge ${kelas}`;
  badge.textContent = teks;
  return badge;
}

function buatBadgeStatus(tersedia) {
  return tersedia
    ? buatBadge('✓ Tersedia', 'badge--tersedia')
    : buatBadge('– Tidak tersedia', 'badge--tidak-tersedia');
}

function buatGambar(kamar, kelas = '') {
  const gambar = document.createElement('img');
  gambar.src = kamar.imageUrl || '/images/placeholder.svg';
  gambar.alt = `Foto ${kamar.nama}`;
  gambar.loading = 'lazy';
  if (kelas) gambar.className = kelas;
  gambar.addEventListener('error', () => {
    if (gambar.dataset.fallback === 'true') return;
    gambar.dataset.fallback = 'true';
    gambar.src = '/images/placeholder.svg';
  });
  return gambar;
}

function buatTombolWhatsApp(kamar) {
  const url = buildWhatsAppUrl(NOMOR_WHATSAPP, kamar);

  if (!kamar.tersedia) {
    const tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.className = 'btn btn--primary btn--disabled';
    tombol.textContent = 'Tidak tersedia';
    tombol.disabled = true;
    tombol.setAttribute('aria-disabled', 'true');
    return tombol;
  }

  if (!url) {
    const tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.className = 'btn btn--primary btn--disabled';
    tombol.textContent = 'Nomor WhatsApp belum valid';
    tombol.disabled = true;
    tombol.setAttribute('aria-disabled', 'true');
    return tombol;
  }

  const tautan = document.createElement('a');
  tautan.className = 'btn btn--primary';
  tautan.href = url;
  tautan.target = '_blank';
  tautan.rel = 'noopener noreferrer';
  tautan.textContent = 'Booking via WhatsApp';
  tautan.setAttribute(
    'aria-label',
    `Booking ${kamar.nama} via WhatsApp (membuka tab baru)`,
  );
  return tautan;
}

function buatKartuKamar(kamar) {
  const kartu = document.createElement('article');
  kartu.className = 'kamar-card';

  const media = document.createElement('div');
  media.className = 'kamar-card__media';
  media.append(buatGambar(kamar));

  const isi = document.createElement('div');
  isi.className = 'kamar-card__body';

  const nama = document.createElement('h3');
  nama.className = 'kamar-card__nama';
  nama.textContent = kamar.nama;

  const badges = document.createElement('div');
  badges.className = 'kamar-card__badges';
  badges.append(
    buatBadge(kamar.tipe, 'badge--tipe'),
    buatBadgeStatus(kamar.tersedia),
  );

  const barisHarga = document.createElement('p');
  barisHarga.className = 'kamar-card__harga-baris';
  const harga = document.createElement('span');
  harga.className = 'kamar-card__harga';
  harga.textContent = formatRupiah(kamar.harga);
  const perMalam = document.createElement('span');
  perMalam.className = 'kamar-card__per-malam';
  perMalam.textContent = '/ malam';
  barisHarga.append(harga, perMalam);

  const kapasitas = document.createElement('p');
  kapasitas.className = 'kamar-card__kapasitas';
  kapasitas.textContent = `${kamar.kapasitas} tamu`;

  const deskripsi = document.createElement('p');
  deskripsi.className = 'kamar-card__deskripsi';
  deskripsi.textContent = kamar.deskripsi;

  const footer = document.createElement('div');
  footer.className = 'kamar-card__footer';
  footer.append(buatTombolWhatsApp(kamar));

  isi.append(nama, badges, barisHarga, kapasitas, deskripsi);
  kartu.append(media, isi, footer);

  return kartu;
}

function buatEmptyStateKatalog(total) {
  const kosong = document.createElement('div');
  kosong.className = 'empty-state';

  const judul = document.createElement('h3');
  judul.textContent =
    total === 0 ? 'Belum ada kamar' : 'Tidak ada kamar yang cocok';

  const bantu = document.createElement('p');
  bantu.textContent =
    total === 0
      ? 'Pengelola belum menambahkan kamar.'
      : 'Coba ubah kata kunci atau filter Anda.';

  kosong.append(judul, bantu);

  if (total > 0) {
    const tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.className = 'btn btn--secondary';
    tombol.textContent = 'Reset filter';
    tombol.addEventListener('click', resetFilterKatalog);
    kosong.append(tombol);
  }

  return kosong;
}

function resetFilterKatalog() {
  filter.query = '';
  filter.tipe = 'semua';
  filter.status = 'semua';
  filter.urutan = 'default';

  const inputCari = document.getElementById('cari-kamar');
  const selectTipe = document.getElementById('filter-tipe');
  const selectStatus = document.getElementById('filter-status');
  const selectUrut = document.getElementById('filter-urut');
  if (inputCari) inputCari.value = '';
  if (selectTipe) selectTipe.value = 'semua';
  if (selectStatus) selectStatus.value = 'semua';
  if (selectUrut) selectUrut.value = 'default';

  renderKatalog();
  inputCari?.focus();
}

function renderKatalog() {
  const grid = document.getElementById('daftar-kamar');
  const hasil = document.getElementById('hasil-kamar');
  const section = document.getElementById('katalog');
  if (!grid || !hasil || !section) return;

  const daftar = filterRooms(kamarAktif, filter);
  section.setAttribute('aria-busy', 'false');
  hasil.textContent = `Menampilkan ${daftar.length} dari ${kamarAktif.length} kamar`;

  if (daftar.length === 0) {
    grid.replaceChildren(buatEmptyStateKatalog(kamarAktif.length));
    return;
  }

  grid.replaceChildren(...daftar.map(buatKartuKamar));
}

export function initKatalogControls() {
  const inputCari = document.getElementById('cari-kamar');
  const selectTipe = document.getElementById('filter-tipe');
  const selectStatus = document.getElementById('filter-status');
  const selectUrut = document.getElementById('filter-urut');

  inputCari?.addEventListener('input', (event) => {
    filter.query = event.target.value;
    renderKatalog();
  });
  selectTipe?.addEventListener('change', (event) => {
    filter.tipe = event.target.value;
    renderKatalog();
  });
  selectStatus?.addEventListener('change', (event) => {
    filter.status = event.target.value;
    renderKatalog();
  });
  selectUrut?.addEventListener('change', (event) => {
    filter.urutan = event.target.value;
    renderKatalog();
  });
}

// --- Dashboard ---

function buatSel(teks, label) {
  const sel = document.createElement('td');
  sel.dataset.label = label;
  sel.textContent = teks;
  return sel;
}

function buatBarisKamar(kamar) {
  const baris = document.createElement('tr');

  const foto = document.createElement('td');
  foto.className = 'tabel-foto';
  foto.dataset.label = '';
  foto.append(buatGambar(kamar, 'tabel-thumb'));

  const nama = buatSel(kamar.nama, 'Nama');
  const tipe = buatSel(kamar.tipe, 'Tipe');
  const harga = buatSel(formatRupiah(kamar.harga), 'Harga');
  const kapasitas = buatSel(`${kamar.kapasitas} tamu`, 'Kapasitas');

  const status = document.createElement('td');
  status.dataset.label = 'Status';
  status.append(buatBadgeStatus(kamar.tersedia));

  const aksi = document.createElement('td');
  aksi.dataset.label = 'Aksi';
  aksi.className = 'tabel-aksi';

  const grupAksi = document.createElement('div');
  grupAksi.className = 'aksi-baris';

  const btnUbah = document.createElement('button');
  btnUbah.type = 'button';
  btnUbah.className = 'btn btn--secondary btn--sm';
  btnUbah.dataset.aksi = 'ubah';
  btnUbah.dataset.id = kamar.id;
  btnUbah.textContent = 'Ubah';
  btnUbah.setAttribute('aria-label', `Ubah ${kamar.nama}`);

  const btnHapus = document.createElement('button');
  btnHapus.type = 'button';
  btnHapus.className = 'btn btn--danger-outline btn--sm';
  btnHapus.dataset.aksi = 'hapus';
  btnHapus.dataset.id = kamar.id;
  btnHapus.textContent = 'Hapus';
  btnHapus.setAttribute('aria-label', `Hapus ${kamar.nama}`);

  const btnStatus = document.createElement('button');
  btnStatus.type = 'button';
  btnStatus.className = 'btn btn--ghost btn--sm';
  btnStatus.dataset.aksi = 'toggle';
  btnStatus.dataset.id = kamar.id;
  btnStatus.textContent = 'Ubah status';
  btnStatus.setAttribute('aria-label', `Ubah status ${kamar.nama}`);

  grupAksi.append(btnUbah, btnHapus, btnStatus);
  aksi.append(grupAksi);

  baris.append(foto, nama, tipe, harga, kapasitas, status, aksi);
  return baris;
}

function renderRingkasanKategori() {
  const wadah = document.getElementById('ringkasan-kategori');
  if (!wadah) return;

  wadah.replaceChildren(
    ...TIPE_KAMAR.map((tipe) => {
      const jumlah = kamarAktif.filter((kamar) => kamar.tipe === tipe).length;
      const chip = document.createElement('span');
      chip.className = 'ringkasan-chip';
      chip.textContent = `${tipe}: ${jumlah}`;
      return chip;
    }),
  );
}

function renderDashboard() {
  const totalEl = document.getElementById('total-kamar');
  const tersediaEl = document.getElementById('total-tersedia');
  const tbody = document.getElementById('tabel-kamar-body');
  const tabelWrap = document.getElementById('tabel-wrap');
  const kosong = document.getElementById('dashboard-empty');
  if (!totalEl || !tersediaEl || !tbody) return;

  const total = kamarAktif.length;
  const tersedia = kamarAktif.filter((kamar) => kamar.tersedia).length;

  totalEl.textContent = String(total);
  tersediaEl.textContent = String(tersedia);
  tbody.replaceChildren(...kamarAktif.map(buatBarisKamar));
  renderRingkasanKategori();

  const tanpaKamar = total === 0;
  if (tabelWrap) tabelWrap.hidden = tanpaKamar;
  if (kosong) kosong.hidden = !tanpaKamar;
}

export function renderSemua(kamar) {
  kamarAktif = kamar;
  renderKatalog();
  renderDashboard();
}

// --- Navigasi ---

export function initNavigasi() {
  const tautan = document.querySelectorAll('[data-view-link]');
  const tautanNav = document.querySelectorAll('.navbar__nav [data-view-link]');
  const tampilan = document.querySelectorAll('[data-view]');

  function tampilkan(nama, fokus = true) {
    tampilan.forEach((section) => {
      section.hidden = section.dataset.view !== nama;
    });

    tautanNav.forEach((el) => {
      if (el.dataset.viewLink === nama) {
        el.setAttribute('aria-current', 'page');
      } else {
        el.removeAttribute('aria-current');
      }
    });

    if (fokus) {
      const judul = document.querySelector(`[data-view="${nama}"] h1, [data-view="${nama}"] h2[tabindex="-1"]`);
      if (judul) {
        judul.setAttribute('tabindex', '-1');
        judul.focus();
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  tautan.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      tampilkan(el.dataset.viewLink);
    });
  });

  document
    .getElementById('notice-tutup')
    ?.addEventListener('click', sembunyikanNotice);

  tampilkan('katalog', false);
}

// --- Notice & status ---

export function tampilkanNotice(pesan, jenis = 'warning') {
  const notice = document.getElementById('notice');
  const teks = document.getElementById('notice-pesan');
  if (!notice || !teks) return;

  teks.textContent = pesan;
  notice.classList.toggle('notice--warning', jenis === 'warning');
  notice.classList.toggle('notice--error', jenis === 'error');
  notice.setAttribute('role', jenis === 'error' ? 'alert' : 'status');
  notice.hidden = false;
}

export function sembunyikanNotice() {
  const notice = document.getElementById('notice');
  if (notice) notice.hidden = true;
}

export function tampilkanStatus(pesan) {
  const status = document.getElementById('status-dashboard');
  if (status) status.textContent = pesan;
}

// --- Dashboard: form dan aksi ---

function buatIdKamar() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `kamar-${crypto.randomUUID()}`;
  }
  return `kamar-${Date.now()}`;
}

const FIELD_ERROR_ID = {
  nama: 'error-nama',
  tipe: 'error-tipe',
  harga: 'error-harga',
  kapasitas: 'error-kapasitas',
  deskripsi: 'error-deskripsi',
  imageUrl: 'error-imageUrl',
  tersedia: 'error-tersedia',
};

export function initDashboard(opsi) {
  const dialogForm = document.getElementById('dialog-form');
  const form = document.getElementById('form-kamar');
  const dialogHapus = document.getElementById('dialog-hapus');
  const dialogReset = document.getElementById('dialog-reset');
  const tbody = document.getElementById('tabel-kamar-body');
  if (!dialogForm || !form || !dialogHapus || !dialogReset || !tbody) return;

  const judulForm = document.getElementById('dialog-form-judul');
  const teksHapus = document.getElementById('teks-hapus');
  const btnBatalHapus = document.getElementById('btn-batal-hapus');
  const btnKonfirmasiHapus = document.getElementById('btn-konfirmasi-hapus');
  const btnBatalReset = document.getElementById('btn-batal-reset');
  const btnKonfirmasiReset = document.getElementById('btn-konfirmasi-reset');
  const hitungDeskripsi = document.getElementById('hitung-deskripsi');
  const deskripsi = form.elements.deskripsi;

  let modeEditId = null;
  let hapusId = null;

  function perbaruiHitungan() {
    if (hitungDeskripsi && deskripsi) {
      hitungDeskripsi.textContent = `${deskripsi.value.length} / 300`;
    }
  }

  function bersihkanErrorField(nama) {
    const id = FIELD_ERROR_ID[nama];
    const input = form.elements[nama];
    const error = id ? document.getElementById(id) : null;

    if (error) {
      error.hidden = true;
      error.textContent = '';
    }
    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  function bersihkanError() {
    Object.keys(FIELD_ERROR_ID).forEach(bersihkanErrorField);
  }

  function tampilkanError(errors) {
    Object.entries(errors).forEach(([nama, pesan]) => {
      const id = FIELD_ERROR_ID[nama];
      const input = form.elements[nama];
      const error = id ? document.getElementById(id) : null;
      if (!input || !error) return;

      error.textContent = pesan;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
    });

    form.querySelector('[aria-invalid="true"]')?.focus();
  }

  function bukaForm(kamar = null) {
    modeEditId = kamar?.id ?? null;
    judulForm.textContent = kamar ? 'Ubah kamar' : 'Tambah kamar';

    form.reset();
    form.elements.nama.value = kamar?.nama ?? '';
    form.elements.tipe.value = kamar?.tipe ?? 'Standard';
    form.elements.harga.value = kamar ? String(kamar.harga) : '0';
    form.elements.kapasitas.value = kamar ? String(kamar.kapasitas) : '1';
    form.elements.deskripsi.value = kamar?.deskripsi ?? '';
    form.elements.imageUrl.value = kamar?.imageUrl ?? '';
    form.elements.tersedia.checked = kamar ? kamar.tersedia : true;

    bersihkanError();
    perbaruiHitungan();

    if (!dialogForm.open) dialogForm.showModal();
    form.elements.nama.focus();
  }

  function bukaHapus(kamar) {
    hapusId = kamar.id;
    teksHapus.textContent = `"${kamar.nama}" akan dihapus dari katalog dan dashboard. Tindakan ini tidak dapat dibatalkan.`;
    if (!dialogHapus.open) dialogHapus.showModal();
    btnBatalHapus.focus();
  }

  document.getElementById('btn-tambah')?.addEventListener('click', () => bukaForm());
  document
    .getElementById('btn-tambah-empty')
    ?.addEventListener('click', () => bukaForm());

  document.getElementById('btn-tutup-form')?.addEventListener('click', () => {
    dialogForm.close();
  });
  document.getElementById('btn-batal-form')?.addEventListener('click', () => {
    dialogForm.close();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (!dialogReset.open) dialogReset.showModal();
    btnBatalReset.focus();
  });
  btnBatalReset.addEventListener('click', () => dialogReset.close());
  btnKonfirmasiReset.addEventListener('click', () => {
    opsi.reset();
    dialogReset.close();
  });

  btnBatalHapus.addEventListener('click', () => dialogHapus.close());
  btnKonfirmasiHapus.addEventListener('click', () => {
    if (!hapusId) return;
    const next = opsi.getKamar().filter((kamar) => kamar.id !== hapusId);
    hapusId = null;
    dialogHapus.close();
    opsi.simpan(next, 'Kamar dihapus.');
  });

  form.addEventListener('input', (event) => {
    if (event.target.name) bersihkanErrorField(event.target.name);
    if (event.target === deskripsi) perbaruiHitungan();
  });
  form.addEventListener('change', (event) => {
    if (event.target.name) bersihkanErrorField(event.target.name);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const dataForm = new FormData(form);
    const hargaMentah = String(dataForm.get('harga') ?? '').trim();
    const kapasitasMentah = String(dataForm.get('kapasitas') ?? '').trim();

    const hasil = validasiKamar({
      nama: String(dataForm.get('nama') ?? ''),
      tipe: String(dataForm.get('tipe') ?? ''),
      harga: hargaMentah === '' ? NaN : Number(hargaMentah),
      kapasitas: kapasitasMentah === '' ? NaN : Number(kapasitasMentah),
      deskripsi: String(dataForm.get('deskripsi') ?? ''),
      imageUrl: String(dataForm.get('imageUrl') ?? ''),
      tersedia: form.elements.tersedia.checked,
    });

    bersihkanError();
    if (!hasil.valid) {
      tampilkanError(hasil.errors);
      return;
    }

    const daftar = opsi.getKamar();
    const data = hasil.data;
    let next;

    if (modeEditId) {
      next = daftar.map((kamar) =>
        kamar.id === modeEditId ? { ...data, id: modeEditId } : kamar,
      );
    } else {
      next = [...daftar, { ...data, id: buatIdKamar() }];
    }

    dialogForm.close();
    opsi.simpan(next, 'Kamar disimpan.');
  });

  tbody.addEventListener('click', (event) => {
    const tombol = event.target.closest('button[data-aksi]');
    if (!tombol) return;

    const kamar = opsi
      .getKamar()
      .find((item) => item.id === tombol.dataset.id);
    if (!kamar) return;

    if (tombol.dataset.aksi === 'ubah') {
      bukaForm(kamar);
      return;
    }

    if (tombol.dataset.aksi === 'hapus') {
      bukaHapus(kamar);
      return;
    }

    if (tombol.dataset.aksi === 'toggle') {
      const next = opsi.getKamar().map((item) =>
        item.id === kamar.id
          ? { ...item, tersedia: !item.tersedia }
          : item,
      );
      opsi.simpan(next, 'Status kamar diperbarui.');
    }
  });
}
