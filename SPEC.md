# SPEC — StayEase

Sistem katalog dan booking kamar homestay berbasis web untuk latihan 1 hari.

| Item | Nilai |
| --- | --- |
| Nama produk | StayEase |
| Jenis | Aplikasi web statis (single-page) |
| Tech stack | Vite + JavaScript vanilla (tanpa framework UI) |
| Backend | Tidak ada |
| Autentikasi | Tidak ada (tanpa login, tanpa login palsu) |
| Penyimpanan | `localStorage` browser |
| Target latihan | 1 hari kerja (MVP selesai dan dapat diperiksa manual) |
| Versi dokumen | 1.0 — 19 November 2026 |

---

## 1. Tujuan

Menyediakan aplikasi contoh yang memungkinkan calon tamu melihat katalog kamar homestay, menyaring kamar sesuai kebutuhan, lalu menghubungi pengelola melalui WhatsApp; sekaligus memberi pengelola homestay dashboard demo untuk menambah, mengubah, dan menghapus data kamar.

Tujuan latihan:

- Melatih alur kerja System Analyst → Software Engineer dalam satu hari.
- Menghasilkan aplikasi yang seluruh perilakunya dapat diverifikasi manual tanpa alat otomasi khusus.
- Menjadi contoh penerapan CRUD + pencarian/filter/sorting + persistensi lokal tanpa backend.

**Definisi sukses:** seluruh acceptance criteria di Bagian 9 lolos saat diperiksa manual di browser, dan data kamar tetap ada setelah halaman di-refresh.

---

## 2. Pengguna

Kedua peran memakai **satu perangkat dan satu sesi browser yang sama**; tidak ada pemisahan akun, hak akses, atau halaman login.

### 2.1 Calon tamu
- Melihat daftar kamar beserta foto, harga, kapasitas, dan status ketersediaan.
- Mencari kamar berdasarkan nama/tipe/deskripsi.
- Memfilter kamar berdasarkan tipe dan status ketersediaan.
- Mengurutkan kamar berdasarkan harga atau nama.
- Menekan tombol booking yang membuka chat WhatsApp ke pengelola dengan pesan yang sudah terisi.

### 2.2 Pengelola homestay
- Melihat ringkasan jumlah total kamar dan jumlah kamar tersedia.
- Menambah kamar baru melalui form.   
- Mengubah data kamar yang sudah ada.
- Menghapus kamar.
- Melihat perubahan langsung tercermin di katalog tamu dan tetap tersimpan setelah refresh.

### 2.3 Asumsi konteks pemakaian
- Pengguna memakai browser modern desktop atau mobile.
- Nomor WhatsApp pengelola adalah data contoh yang ditetapkan di konfigurasi aplikasi, bukan data pribadi nyata.

---

## 3. Daftar Fitur (MVP)

Prioritas: **W** = wajib untuk MVP, **S** = sebaiknya ada bila waktu memungkinkan.

### 3.1 Katalog (sisi tamu)
| ID | Fitur | Prioritas | Ringkasan |
| --- | --- | --- | --- |
| F-01 | Katalog 6 kamar contoh | W | Saat pertama dibuka (localStorage kosong), aplikasi memuat 6 kamar contoh dengan data nonpribadi. |
| F-02 | Foto/placeholder lokal | W | Setiap kartu menampilkan gambar dari folder aset lokal; jika `imageUrl` kosong atau gagal dimuat, tampil placeholder lokal. Tidak ada hotlink ke layanan eksternal. |
| F-03 | Informasi kartu kamar | W | Menampilkan nama, tipe, harga per malam (format Rupiah), kapasitas, dan status ketersediaan. |
| F-04 | Pencarian | W | Satu kolom pencarian yang mencocokkan nama, tipe, dan deskripsi (case-insensitive, substring). |
| F-05 | Filter | W | Filter tipe kamar (semua + tiap tipe yang ada) dan filter status (semua / tersedia / tidak tersedia). |
| F-06 | Sorting | W | Urutkan: default (urutan data), harga termurah, harga termahal, nama A–Z. |
| F-07 | Tombol booking WhatsApp | W | Tombol per kamar membuka `https://wa.me/<nomor>?text=<pesan>` dengan pesan berisi nama kamar, tipe, harga, dan kapasitas. Tombol nonaktif/hidden untuk kamar tidak tersedia. |
| F-08 | Keadaan kosong | W | Bila hasil pencarian/filter kosong, tampil pesan "Tidak ada kamar yang cocok" dan tombol reset filter. |

### 3.2 Dashboard demo (sisi pengelola)
| ID | Fitur | Prioritas | Ringkasan |
| --- | --- | --- | --- |
| F-09 | Ringkasan | W | Menampilkan total kamar dan jumlah kamar tersedia; ikut berubah setiap ada tambah/ubah/hapus. |
| F-10 | Tambah kamar | W | Form dengan seluruh field model kamar dan validasi; kamar baru langsung muncul di katalog. |
| F-11 | Ubah kamar | W | Form terisi data lama; perubahan tersimpan dan langsung tercermin di katalog. |
| F-12 | Hapus kamar | W | Konfirmasi sebelum menghapus; kamar hilang dari katalog dan ringkasan. |
| F-13 | Daftar kamar pada dashboard | W | Tabel/daftar ringkas semua kamar dengan aksi Ubah dan Hapus. |
| F-14 | Navigasi katalog ↔ dashboard | W | Pindah tampilan dalam satu halaman (dua section/tab), tanpa reload dan tanpa routing server. |
| F-15 | Toggle ketersediaan cepat | S | Tombol untuk mengubah status `tersedia` langsung dari daftar dashboard. |

### 3.3 Persistensi
| ID | Fitur | Prioritas | Ringkasan |
| --- | --- | --- | --- |
| F-16 | Simpan ke localStorage | W | Seluruh koleksi kamar disimpan sebagai JSON di satu key, ditulis ulang setiap ada perubahan. |
| F-17 | Muat dari localStorage | W | Saat halaman dibuka, data dibaca dari localStorage; jika tidak ada/rusak, fallback ke 6 kamar contoh. |
| F-18 | Reset data demo | S | Tombol mengembalikan data ke 6 kamar contoh setelah konfirmasi. |

---

## 4. Data Model

### 4.1 Entitas `Kamar`

| Field | Tipe | Aturan validasi | Contoh |
| --- | --- | --- | --- |
| `id` | string | Unik, tidak kosong. Dibuat otomatis saat tambah (mis. `kamar-<timestamp>` atau `crypto.randomUUID()`). Tidak dapat diedit pengguna. | `"kamar-1712345678901"` |
| `nama` | string | Wajib, setelah trim 1–60 karakter. | `"Kamar Melati"` |
| `tipe` | string | Wajib, salah satu dari `"Standard"`, `"Deluxe"`, `"Family"`. | `"Deluxe"` |
| `harga` | number | Wajib, bilangan bulat ≥ 0 (Rupiah per malam). Input form berupa angka; disimpan sebagai number. | `350000` |
| `kapasitas` | integer | Wajib, bilangan bulat ≥ 1, maksimum wajar 10. | `2` |
| `deskripsi` | string | Opsional, maksimum 300 karakter. | `"Kamar dengan kasur queen dan balkon."` |
| `imageUrl` | string | Opsional. Path aset lokal (`/images/...`) atau URL `http(s)`. Jika kosong → placeholder lokal. | `"/images/melati.jpg"` |
| `tersedia` | boolean | Wajib; `true` = dapat dibooking. | `true` |

### 4.2 Bentuk data tersimpan

Satu key localStorage: `stayease.kamar.v1`.

```json
{
  "version": 1,
  "kamar": [
    {
      "id": "kamar-001",
      "nama": "Kamar Melati",
      "tipe": "Standard",
      "harga": 250000,
      "kapasitas": 2,
      "deskripsi": "Kamar standard dengan kasur double dan kipas angin.",
      "imageUrl": "/images/kamar-1.jpg",
      "tersedia": true
    }
  ]
}
```

Catatan:
- `version` dipakai untuk memudahkan migrasi format di masa depan; untuk MVP hanya `1`.
- Jika JSON tidak valid atau `kamar` bukan array, aplikasi mengabaikan isi localStorage dan memuat data contoh (tanpa crash).
- Semua operasi tulis dilakukan pada satu koleksi di memori, lalu seluruh koleksi diserialisasi ulang (tanpa operasi parsial).

### 4.3 Data contoh (6 kamar)

Semua data fiktif dan nonpribadi. Nomor WhatsApp pengelola diletakkan di satu konstanta konfigurasi (mis. `+62 812-0000-0000`) dan didokumentasikan sebagai placeholder.

| id | nama | tipe | harga | kapasitas | tersedia |
| --- | --- | --- | --- | --- | --- |
| kamar-001 | Kamar Melati | Standard | 250000 | 2 | true |
| kamar-002 | Kamar Anggrek | Standard | 275000 | 2 | false |
| kamar-003 | Kamar Kenanga | Deluxe | 400000 | 2 | true |
| kamar-004 | Kamar Cempaka | Deluxe | 450000 | 3 | true |
| kamar-005 | Kamar Bougenville | Family | 650000 | 4 | false |
| kamar-006 | Kamar Teratai | Family | 700000 | 5 | true |

---

## 5. Nonfunctional Requirements

| ID | Kategori | Requirement | Cara verifikasi |
| --- | --- | --- | --- |
| N-01 | Kinerja | Waktu muat awal < 2 detik dan render ulang katalog < 200 ms pada perangkat latihan dengan 6–50 kamar. | Buka DevTools → Performance/Network; amati tidak ada jeda terasa saat mengetik pencarian. |
| N-02 | Responsif | Layout dapat dipakai pada lebar 360 px hingga 1440 px; kartu katalog menjadi 1 kolom di mobile. | Ubah lebar jendela/Device Toolbar. |
| N-03 | Aksesibilitas dasar | Semua input punya `<label>`; tombol dapat difokus dengan keyboard; gambar punya `alt`; kontras teks memadai. | Tab melalui halaman; periksa elemen di DevTools. |
| N-04 | Keamanan data | Tidak ada API key, token, atau kredensial di source code, `.env`, maupun localStorage. Hanya data kamar yang disimpan. | Cari `key`, `token`, `secret` di repo; periksa Application → Local Storage. |
| N-05 | Keamanan rendering | Input pengguna ditampilkan sebagai teks (bukan HTML mentah) untuk mencegah XSS. | Simpan kamar bernama `<img src=x onerror=alert(1)>`; harus tampil sebagai teks, tanpa alert. |
| N-06 | Robustness | Data localStorage rusak/kosong tidak membuat aplikasi blank; fallback ke data contoh. | Ubah nilai key secara manual di DevTools menjadi `{`, lalu refresh. |
| N-07 | Konsistensi | Katalog, ringkasan, dan dashboard selalu menampilkan data dari satu sumber (state yang sama). | Tambah/ubah/hapus kamar, bandingkan angka dan isi di kedua tampilan. |
| N-08 | Keterbacaan kode | Struktur file terpisah: data/konstanta, penyimpanan, render/UI, handler; tanpa dependency UI tambahan. | Tinjau struktur folder dan `package.json`. |
| N-09 | Tanpa perintah berbahaya | Hanya perintah aman (`npm install`, `npm run dev`, `npm run build`). Tidak ada skrip yang menghapus file di luar folder proyek atau mengakses jaringan tak perlu. | Tinjau `package.json` dan riwayat perintah. |
| N-10 | Offline-first (data) | Setelah aset termuat, fungsi inti (lihat, cari, filter, CRUD) bekerja tanpa backend. | Matikan jaringan setelah halaman terbuka; CRUD tetap berjalan. |
| N-11 | Batasan data | Semua data contoh nonpribadi; nomor WhatsApp adalah placeholder. | Tinjau data seed dan konstanta konfigurasi. |

---

## 6. Risiko

| ID | Risiko | Dampak | Kemungkinan | Mitigasi |
| --- | --- | --- | --- | --- |
| R-01 | Scope creep (menambah login, pembayaran, backend) pada latihan 1 hari. | Tinggi | Sedang | Out-of-scope di Bagian 7 bersifat mengikat; fitur `S` hanya dikerjakan setelah semua `W` lolos. |
| R-02 | Data localStorage terhapus saat mode incognito/clear browsing data. | Sedang | Sedang | Dokumentasikan bahwa persistensi hanya lokal dan bersifat demo; sediakan tombol reset data contoh. |
| R-03 | Nomor WhatsApp contoh tidak valid sehingga tombol tidak membuka chat. | Rendah | Tinggi | Nomor placeholder terpusat di satu konstanta; dokumentasikan cara menggantinya; tombol tetap menghasilkan URL yang benar. |
| R-04 | Perbedaan perilaku `wa.me` di desktop vs mobile (butuh login WhatsApp Web). | Rendah | Sedang | Terima sebagai keterbatasan; verifikasi manual cukup memastikan URL dan pesan terisi benar. |
| R-05 | XSS melalui input nama/deskripsi karena render HTML mentah. | Tinggi | Sedang | Selalu render via `textContent`/escaping (N-05); uji dengan payload di acceptance criteria. |
| R-06 | Gambar lokal tidak ditemukan sehingga kartu tampak rusak. | Rendah | Sedang | Handler `onerror` mengganti ke placeholder lokal; uji dengan `imageUrl` tidak valid. |
| R-07 | Waktu habis sebelum dashboard selesai. | Sedang | Sedang | Urutan iterasi di Bagian 10 memprioritaskan katalog fungsional lebih dulu, dashboard setelahnya. |
| R-08 | Data contoh tanpa sengaja memuat informasi pribadi. | Sedang | Rendah | Gunakan nama kamar generik dan nomor placeholder; tinjau seed sebelum commit. |
| R-09 | Ketergantungan pada AI yang menghasilkan kode tidak sesuai spesifikasi. | Sedang | Sedang | Acceptance criteria manual menjadi kontrak; periksa setiap iterasi terhadap kriteria terkait. |

Catatan latihan: risiko yang paling relevan untuk diperiksa pada sesi ini adalah **R-09** — memastikan keluaran AI benar-benar sesuai SPEC dan bukan sekadar "terlihat jalan".

---

## 7. Out of Scope

Hal-hal berikut **tidak** dikerjakan pada MVP:

- Backend, database, API, server-side rendering.
- Login, registrasi, peran/otorisasi nyata, atau login palsu.
- Pembayaran online, deposit, kalkulasi pajak.
- Proses booking nyata di dalam aplikasi (tanggal check-in/out, cek bentrok jadwal, keranjang, riwayat pesanan).
- Integrasi API WhatsApp resmi; hanya deep link `wa.me`.
- Upload file gambar dari perangkat; gambar memakai path aset lokal atau URL.
- Multi-bahasa, mata uang selain IDR, format tanggal kompleks.
- Peta/lokasi, ulasan, rating, favorit, notifikasi email.
- Testing otomatis (unit/E2E), CI/CD, deployment produksi.
- Migrasi data antar-browser/perangkat.

---

## 8. Arsitektur & Struktur yang Diharapkan

Tidak ada kode pada dokumen ini, hanya kontrak struktur.

```
stayease/
├─ index.html
├─ package.json
├─ public/
│  └─ images/            # 6 foto + 1 placeholder lokal
└─ src/
   ├─ main.js            # bootstrap, event listener global, state
   ├─ data.js            # data contoh 6 kamar + konstanta (tipe, nomor WA)
   ├─ storage.js         # load/save/reset localStorage + validasi
   ├─ render.js          # render katalog, ringkasan, daftar dashboard
   └─ style.css
```

Prinsip:
- Satu state array `kamar` di memori sebagai sumber kebenaran; setiap mutasi → `save()` → `render()`.
- Tidak ada framework, tidak ada library UI tambahan.
- Semua akses DOM dibatasi di `render.js`/`main.js`.

---

## 9. Acceptance Criteria (manual)

Setiap kriteria diperiksa di browser pada build dev (`npm run dev`), dengan localStorage dibersihkan sebelum skenario pertama.

### A. Katalog & data awal
1. Buka aplikasi dengan localStorage kosong → tampil **tepat 6 kamar** contoh, masing-masing dengan gambar/placeholder, nama, tipe, harga berformat Rupiah, kapasitas, dan status.
2. Refresh halaman → 6 kamar yang sama masih tampil dan tidak terduplikasi.
3. Harga `0` tampil sebagai "Rp0" (atau "Gratis" bila dipilih) dan tidak dianggap kosong.

### B. Pencarian, filter, sorting
4. Ketik "melati" di pencarian → hanya kamar bernama Melati yang tampil; pencarian tidak case-sensitive ("MELATI" memberi hasil sama).
5. Pencarian juga cocok terhadap tipe dan deskripsi (mis. "family" menemukan kamar Family).
6. Filter tipe "Family" → hanya kamar Family tampil; filter status "Tersedia" → hanya kamar `tersedia: true`.
7. Kombinasi filter tipe + status + pencarian menghasilkan irisan yang benar.
8. Sorting "Harga termurah" → urutan harga menaik; "Harga termahal" → menurun; "Nama A–Z" → alfabetis.
9. Pencarian tanpa hasil → muncul pesan kosong dan tombol reset yang mengembalikan semua kamar.

### C. Booking WhatsApp
10. Klik booking pada kamar tersedia → tab baru mengarah ke `https://wa.me/<nomor>` dengan parameter `text` berisi nama, tipe, harga, dan kapasitas kamar tersebut.
11. Kamar `tersedia: false` → tombol booking tidak dapat diklik (disabled) atau tidak ditampilkan, dan diberi keterangan status.
12. Nomor WhatsApp pada URL sama dengan konstanta konfigurasi dan tidak ada API key/token di halaman maupun source.

### D. Dashboard & CRUD
13. Dashboard menampilkan total kamar = 6 dan tersedia = 4 (sesuai data contoh); ringkasan berubah segera setelah CRUD.
14. Tambah kamar dengan data valid → kamar muncul di daftar dashboard **dan** di katalog; total bertambah 1.
15. Simpan form dengan nama kosong, harga negatif, atau kapasitas `0` → pesan validasi muncul, data tidak tersimpan.
16. Ubah nama/harga kamar → perubahan terlihat di dashboard dan katalog tanpa reload.
17. Hapus kamar → muncul konfirmasi; setelah dikonfirmasi kamar hilang dari kedua tampilan dan total berkurang; bila dibatalkan data tetap.
18. Setelah tambah/ubah/hapus, refresh halaman → perubahan tetap ada (localStorage).
19. Tombol reset data (bila F-18 dikerjakan) mengembalikan 6 kamar contoh setelah konfirmasi.

### E. Keamanan & ketahanan
20. Menyimpan kamar dengan nama `<img src=x onerror=alert(1)>` → teks tampil apa adanya, tidak ada alert/eksekusi skrip.
21. Mengubah isi key localStorage menjadi JSON rusak lalu refresh → aplikasi tetap tampil dengan data contoh, tanpa error di console yang menghentikan aplikasi.
22. Mengosongkan `imageUrl` atau mengisinya dengan path tidak valid → placeholder lokal tampil, bukan ikon gambar rusak.
23. Mode incognito atau setelah clear storage → aplikasi kembali ke data contoh; tidak ada error.

### F. Build
24. `npm run build` selesai tanpa error dan folder `dist/` dapat dibuka/di-preview tanpa error console terkait aset yang hilang.

---

## 10. Implementation Plan per Iterasi

Total ±1 hari kerja. Setiap iterasi berakhir dengan pemeriksaan manual terhadap kriteria terkait sebelum lanjut.

### Iterasi 0 — Persiapan (≈30 menit)
- Scaffold Vite vanilla (`npm create vite@latest`), bersihkan boilerplate.
- Siapkan `public/images/` (6 foto stok lokal berlisensi bebas atau placeholder SVG) + 1 placeholder.
- Tetapkan konstanta: tipe kamar, nomor WhatsApp placeholder, key localStorage.
- **Output:** halaman kosong berjalan, struktur folder sesuai Bagian 8.
- **Selesai bila:** `npm run dev` menyala, aset gambar dapat diakses.

### Iterasi 1 — Model data & persistensi (≈45 menit)
- Implementasi `data.js` (6 kamar contoh) dan `storage.js` (`load`, `save`, `reset`, validasi bentuk data).
- Seed otomatis saat localStorage kosong/rusak.
- **Selesai bila:** AC 1, 2, 19, 21 lolos (diperiksa lewat console/render sementara).

### Iterasi 2 — Katalog read-only (≈1,5 jam)
- Render kartu kamar: gambar + placeholder fallback, nama, tipe, harga Rupiah, kapasitas, status.
- Layout responsif dasar dan navigasi katalog/dashboard.
- **Selesai bila:** AC 1–3, 22 lolos.

### Iterasi 3 — Pencarian, filter, sorting (≈1,5 jam)
- Input pencarian (nama/tipe/deskripsi), filter tipe, filter status, sorting.
- Empty state + reset filter.
- **Selesai bila:** AC 4–9 lolos.

### Iterasi 4 — Tombol booking WhatsApp (≈45 menit)
- Bangun URL `wa.me` dengan pesan ter-encode (`encodeURIComponent`).
- Disable/hide tombol untuk kamar tidak tersedia.
- **Selesai bila:** AC 10–12 lolos.

### Iterasi 5 — Dashboard & CRUD (≈2,5 jam)
- Ringkasan total & tersedia.
- Form tambah/ubah dengan validasi (nama, harga ≥ 0, kapasitas ≥ 1, tipe valid).
- Hapus dengan konfirmasi; render ulang dashboard + katalog; simpan ke localStorage setiap mutasi.
- **Selesai bila:** AC 13–18 lolos, termasuk uji XSS (AC 20).

### Iterasi 6 — Penyempurnaan & verifikasi akhir (≈1 jam)
- Responsif 360–1440 px, fokus keyboard, label form, `alt` gambar.
- Fitur `S` bila waktu tersisa: toggle ketersediaan cepat (F-15), tombol reset data (F-18).
- Jalankan `npm run build`; periksa ulang seluruh acceptance criteria dari localStorage bersih.
- **Selesai bila:** AC 23–24 lolos dan semua AC `W` tercentang.

### Definition of Done
- Seluruh AC `W` (1–18, 20–23) lolos manual.
- Tidak ada API key/token/secret di repo maupun localStorage.
- `npm run build` sukses tanpa error.
- Data contoh 6 kamar nonpribadi; nomor WhatsApp placeholder terdokumentasi.
- README singkat berisi cara menjalankan dan cara mengganti nomor WhatsApp (opsional tetapi disarankan).
