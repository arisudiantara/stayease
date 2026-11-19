# TASKS — StayEase

Panduan implementasi aplikasi **StayEase**, diturunkan dari `SPEC.md` (v1.0, 19 November 2026) dan `UI-SPEC.md`.
Dokumen ini hanya rencana kerja. **Tidak ada kode aplikasi di dalamnya.**

## Cara Memakai

- Kerjakan milestone **berurutan** (M1 → M10); di dalam milestone, ikuti kolom *Ketergantungan*.
- Setelah tiap milestone, jalankan pemeriksaan manual pada acceptance criteria (AC) terkait sebelum lanjut.
- Centang tugas di sini bila sudah lolos (`[ ]` → `[x]`).

## Konvensi

| Istilah | Arti |
| --- | --- |
| **Must Have** | Wajib untuk MVP (prioritas **W** di SPEC) |
| **Should Have** | Dikerjakan hanya setelah semua Must Have lolos (prioritas **S** di SPEC, atau penyempurnaan UI-SPEC) |
| **AC-n** | Acceptance criteria nomor n di `SPEC.md` Bagian 9 |
| **F-xx / N-xx / R-xx** | Fitur / nonfunctional / risiko di `SPEC.md` |
| **UI §n** | Bagian n di `UI-SPEC.md` |
| **Tn.m** | Tugas ke-m pada milestone n (dipakai di kolom Ketergantungan) |

Aturan kerja:
- Perintah yang diizinkan hanya `npm install`, `npm run dev`, `npm run build`, `npm run preview` (N-09).
- Tanpa framework dan tanpa library UI tambahan (N-08).
- Dilarang menambah fitur di luar scope (SPEC Bagian 7, UI §11): login, tanggal check-in/out, pembayaran, upload gambar, rating, peta, multi-bahasa, testing otomatis, CI/CD, deployment.
- Semua teks dari pengguna dirender sebagai teks, bukan HTML mentah (N-05).

## Ringkasan Milestone

| # | Milestone | Estimasi | AC utama |
| --- | --- | --- | --- |
| M1 | Project scaffold (Vite) | ±30 menit | — |
| M2 | Struktur data dan localStorage | ±45 menit | 1, 2, 19, 21 |
| M3 | UI katalog kamar | ±1,5 jam | 1–3, 22 |
| M4 | Pencarian, filter, dan sorting | ±1 jam | 4–9 |
| M5 | Integrasi WhatsApp | ±30 menit | 10–12 |
| M6 | Dashboard dan CRUD kamar | ±2 jam | 13–19 |
| M7 | Validasi dan keamanan | ±30 menit | 15, 20, 21, 12 |
| M8 | Responsive design dan accessibility | ±45 menit | N-02, N-03 |
| M9 | Testing manual | ±30 menit | 1–24 |
| M10 | Build dan verifikasi akhir | ±15 menit | 23, 24 |
| | **Total** | **±8 jam** | |

Catatan: estimasi memperhitungkan bahwa validasi, aksesibilitas dasar, dan XSS-safe rendering sudah dikerjakan sambil membangun fitur; M7 dan M8 berisi penguatan dan pemeriksaan akhir, bukan pekerjaan dari nol.

## Peta Ketergantungan Antar-Milestone

```
M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10
          └──────────────┘  (M4 dan M5 dapat dikerjakan bergantian setelah M3)
```

---

## M1 — Project Scaffold (Vite)

**Tujuan:** proyek Vite vanilla berjalan dengan struktur sesuai SPEC Bagian 8.

### T1.1 Scaffold proyek Vite vanilla
- **Deskripsi:** Buat proyek dengan template Vite JavaScript vanilla, hapus boilerplate bawaan (counter, logo, gaya contoh), tambahkan `.gitignore` (`node_modules`, `dist`).
- **Acceptance criteria:**
  1. `npm install` dan `npm run dev` berjalan tanpa error.
  2. Halaman kosong terbuka di browser tanpa error di console.
  3. `package.json` tidak memuat framework/library UI tambahan dan hanya berisi skrip `dev`, `build`, `preview`.
- **File:** `package.json`, `index.html`, `src/main.js`, `src/style.css`, `.gitignore`
- **Prioritas:** Must Have
- **Ketergantungan:** —

### T1.2 Susun struktur folder dan kerangka HTML
- **Deskripsi:** Buat berkas sesuai kontrak SPEC Bagian 8 dan kerangka semantik di `index.html` sesuai UI §2: skip link, `header`/`nav`, `main` dengan dua section (katalog, dashboard), `footer`, serta elemen `<dialog>` kosong untuk form dan konfirmasi.
- **Acceptance criteria:**
  1. Struktur: `index.html`, `public/images/`, `src/main.js`, `src/data.js`, `src/storage.js`, `src/render.js`, `src/style.css`.
  2. Landmark `header`, `nav`, `main`, `footer` ada; hanya satu `main`.
  3. Halaman tetap tanpa error console setelah semua modul diimpor.
- **File:** `index.html`, `src/main.js`, `src/data.js`, `src/storage.js`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T1.1

### T1.3 Siapkan aset gambar lokal
- **Deskripsi:** Tambahkan 6 gambar kamar (foto stok berlisensi bebas atau ilustrasi SVG sederhana) dan 1 `placeholder.svg` ke `public/images/`. Tidak ada hotlink eksternal (F-02).
- **Acceptance criteria:**
  1. Membuka `http://localhost:<port>/images/placeholder.svg` menampilkan placeholder.
  2. Keenam gambar kamar dapat dibuka lewat path `/images/<nama-file>`.
  3. Tidak ada URL gambar eksternal di source.
- **File:** `public/images/kamar-1.* … kamar-6.*`, `public/images/placeholder.svg`
- **Prioritas:** Must Have
- **Ketergantungan:** T1.1

**Selesai M1 bila:** `npm run dev` menyala, struktur folder sesuai SPEC Bagian 8, aset gambar dapat diakses.

---

## M2 — Struktur Data dan localStorage

**Tujuan:** satu state `kamar` di memori sebagai sumber kebenaran, tersimpan dan terbaca dari localStorage (F-01, F-16, F-17).

### T2.1 Konstanta konfigurasi
- **Deskripsi:** Di `data.js`, definisikan konstanta terpusat: daftar tipe (`Standard`, `Deluxe`, `Family`), nomor WhatsApp placeholder (mis. `+62 812-0000-0000`), key localStorage `stayease.kamar.v1`, versi data `1`, maksimum panjang (nama 60, deskripsi 300, kapasitas 10). Beri komentar bahwa nomor adalah placeholder.
- **Acceptance criteria:**
  1. Seluruh konstanta berada di satu tempat dan diimpor modul lain (tidak ada nilai ganda).
  2. Komentar menandai nomor WhatsApp sebagai placeholder dan menjelaskan cara menggantinya (R-03, N-11).
- **File:** `src/data.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T1.2

### T2.2 Data contoh 6 kamar
- **Deskripsi:** Tambahkan 6 kamar sesuai SPEC 4.3 (Melati, Anggrek, Kenanga, Cempaka, Bougenville, Teratai) dengan semua field model `Kamar`, termasuk deskripsi dan `imageUrl` ke aset lokal.
- **Acceptance criteria:**
  1. Tepat 6 kamar dengan `id` `kamar-001` … `kamar-006` dan nilai nama/tipe/harga/kapasitas/tersedia sama dengan tabel SPEC 4.3.
  2. 4 kamar `tersedia: true` dan 2 kamar `false`.
  3. Tidak ada data pribadi (R-08).
- **File:** `src/data.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T2.1, T1.3

### T2.3 Fungsi `load`, `save`, `reset`
- **Deskripsi:** Di `storage.js`, implementasikan `load()`, `save(kamar)`, `reset()` dengan bentuk tersimpan `{ "version": 1, "kamar": [...] }` di satu key. Setiap `save` menulis ulang seluruh koleksi. `load` memvalidasi bentuk data: JSON tidak valid, `kamar` bukan array, atau storage kosong → kembalikan salinan data contoh tanpa melempar error.
- **Acceptance criteria:**
  1. localStorage kosong → `load()` mengembalikan 6 kamar contoh (AC-1).
  2. Ubah nilai key menjadi `{` di DevTools lalu muat ulang → aplikasi tidak crash dan memuat data contoh (AC-21).
  3. Application → Local Storage hanya berisi key `stayease.kamar.v1`, tanpa kredensial (N-04).
  4. `reset()` mengembalikan 6 kamar contoh dan menuliskannya ke storage.
- **File:** `src/storage.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T2.2

### T2.4 State dan alur mutasi → `save()` → `render()`
- **Deskripsi:** Di `main.js`, buat satu array `kamar` di memori yang dimuat saat bootstrap; sediakan fungsi pembantu mutasi yang selalu memanggil `save()` lalu `render()`. Akses DOM hanya di `main.js`/`render.js`.
- **Acceptance criteria:**
  1. Refresh halaman → 6 kamar yang sama dan tidak terduplikasi (AC-2).
  2. Mengubah array melalui fungsi mutasi memperbarui localStorage (diperiksa lewat DevTools).
  3. Tidak ada salinan data kedua di luar state tunggal (N-07).
- **File:** `src/main.js`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T2.3

### T2.5 Penanganan gagal tulis storage
- **Deskripsi:** Bungkus penulisan localStorage dengan `try/catch`. Bila gagal (kuota/mode privat), aplikasi tetap berjalan dengan data di memori dan menampilkan banner error (UI §7.3).
- **Acceptance criteria:**
  1. Simulasi di console: `Storage.prototype.setItem = () => { throw new Error('x') }` lalu tambah/ubah kamar → aplikasi tidak crash dan banner "Perubahan tidak dapat disimpan di browser ini." tampil.
  2. Mode incognito: aplikasi memuat data contoh tanpa error (AC-23).
- **File:** `src/storage.js`, `src/main.js`, `src/render.js`
- **Prioritas:** Should Have
- **Ketergantungan:** T2.4

**Selesai M2 bila:** AC-1, 2, 21 lolos (diperiksa lewat console/render sementara); AC-19 diperiksa di M6.

---

## M3 — UI Katalog Kamar

**Tujuan:** katalog read-only dengan kartu kamar bergaya krem + hijau rempah (F-02, F-03, F-14).

### T3.1 Design tokens dan gaya dasar
- **Deskripsi:** Tuangkan UI §3 ke `style.css`: custom property warna, font system stack, skala teks, spacing, radius, bayangan, gerak; reset sederhana; kontainer maks 1120 px; gaya tombol, badge, dan field sesuai UI §6.
- **Acceptance criteria:**
  1. Semua nilai warna/spacing/font diambil dari variabel `:root`, tidak ada hex yang tersebar di aturan lain.
  2. Latar halaman `#FBF7EF`, teks utama `#26241E`, tombol primer `#3E5F3F`.
  3. Tidak ada font atau stylesheet eksternal dimuat (tab Network).
- **File:** `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T1.2

### T3.2 Navbar dan navigasi katalog ↔ dashboard
- **Deskripsi:** Navbar sticky dengan brand dan dua tombol navigasi; klik mengganti tampilan tanpa reload (F-14), item aktif memakai `aria-current="page"` dan garis bawah; fokus pindah ke judul tampilan tujuan.
- **Acceptance criteria:**
  1. Klik "Dashboard" menampilkan section dashboard dan menyembunyikan katalog; klik "Katalog" sebaliknya; URL halaman tidak memuat ulang.
  2. Item aktif terlihat jelas tanpa bergantung warna saja.
  3. Di 360 px, brand dan kedua tombol muat dalam satu baris tanpa scroll horizontal.
- **File:** `index.html`, `src/main.js`, `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T3.1

### T3.3 Hero section
- **Deskripsi:** Hero di tampilan Katalog dengan `h1`, satu paragraf, dan tombol "Lihat kamar" yang menggulir ke toolbar katalog (UI §6.2). Tanpa gambar eksternal.
- **Acceptance criteria:**
  1. Hero tampil hanya di tampilan Katalog.
  2. Tombol "Lihat kamar" menggulir ke bagian katalog dan dapat dioperasikan dengan keyboard.
  3. Judul tidak lebih dari 2 baris di 360 px.
- **File:** `index.html`, `src/style.css`, `src/main.js`
- **Prioritas:** Should Have
- **Ketergantungan:** T3.1

### T3.4 Render kartu kamar dan format Rupiah
- **Deskripsi:** Di `render.js`, buat fungsi render kartu: gambar, nama, badge tipe, badge status, harga `Rp250.000 / malam`, kapasitas "N tamu", deskripsi (dipotong 2 baris). Dibuat dengan DOM API (`createElement`, `textContent`), bukan string HTML dari input pengguna.
- **Acceptance criteria:**
  1. Tepat 6 kartu tampil untuk data contoh dengan nama, tipe, harga berformat Rupiah, kapasitas, dan status (AC-1).
  2. Kamar dengan harga `0` tampil "Rp0" dan tidak dianggap kosong (AC-3).
  3. Status berupa teks (✓ Tersedia / – Tidak tersedia), bukan warna saja.
  4. Nama berisi `<b>x</b>` tampil sebagai teks literal.
- **File:** `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T2.4, T3.1

### T3.5 Fallback gambar dan placeholder
- **Deskripsi:** Setiap `<img>` memiliki `alt` ("Foto {nama}") dan handler `onerror` yang mengganti ke `/images/placeholder.svg` (sekali saja, untuk mencegah loop). `imageUrl` kosong langsung memakai placeholder. Wadah gambar berasio 4:3.
- **Acceptance criteria:**
  1. Kamar dengan `imageUrl` kosong menampilkan placeholder lokal (AC-22).
  2. `imageUrl` = `/images/tidak-ada.jpg` menampilkan placeholder, bukan ikon gambar rusak (AC-22, R-06).
  3. Tidak ada loop permintaan gambar di tab Network.
- **File:** `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T3.4, T1.3

### T3.6 Grid responsif kartu
- **Deskripsi:** Grid 1 kolom di mobile, 2 kolom ≥ 640 px, 3 kolom ≥ 1024 px (UI §3.5, §6.8).
- **Acceptance criteria:**
  1. Di 360 px kartu 1 kolom; di 768 px 2 kolom; di 1280 px 3 kolom.
  2. Tidak ada scroll horizontal pada halaman di 360 px (N-02).
- **File:** `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T3.4

### T3.7 State loading awal dan katalog kosong
- **Deskripsi:** HTML awal memuat teks "Memuat kamar…" di area katalog yang diganti saat render pertama; tambahkan empty state "Belum ada kamar" bila koleksi benar-benar kosong (UI §7.1, §7.2).
- **Acceptance criteria:**
  1. Setelah render pertama, teks "Memuat kamar…" tidak tampil lagi.
  2. Dengan koleksi kosong (setelah semua kamar dihapus di M6), katalog menampilkan "Belum ada kamar" tanpa tombol reset filter.
- **File:** `index.html`, `src/render.js`, `src/style.css`
- **Prioritas:** Should Have
- **Ketergantungan:** T3.4

**Selesai M3 bila:** AC-1, 2, 3, 22 lolos.

---

## M4 — Pencarian, Filter, dan Sorting

**Tujuan:** calon tamu dapat mencari, menyaring, dan mengurutkan kamar (F-04, F-05, F-06, F-08).

### T4.1 Markup toolbar dengan label
- **Deskripsi:** Toolbar berisi kolom pencarian, select tipe, select ketersediaan, select urutkan; semua dengan `<label>` terlihat (UI §6.6–6.7). Opsi tipe dibangun dari daftar tipe di konstanta.
- **Acceptance criteria:**
  1. Klik label memfokuskan kontrol yang sesuai.
  2. Di 360 px tata letak: pencarian satu baris, tipe + ketersediaan dua kolom, urutkan satu baris.
  3. Opsi: Semua tipe/Standard/Deluxe/Family; Semua/Tersedia/Tidak tersedia; Urutan default/Harga termurah/Harga termahal/Nama A–Z.
- **File:** `index.html`, `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T3.4

### T4.2 Pencarian
- **Deskripsi:** Saat mengetik, saring kamar yang nama, tipe, atau deskripsinya mengandung kata kunci (case-insensitive, substring). Kata kunci di-trim.
- **Acceptance criteria:**
  1. Ketik "melati" → hanya Kamar Melati; "MELATI" memberi hasil sama (AC-4).
  2. Ketik "family" → semua kamar tipe Family muncul (AC-5).
  3. Ketik kata dari deskripsi (mis. "kipas") → kamar yang deskripsinya memuat kata itu muncul.
  4. Tidak ada jeda terasa saat mengetik (N-01).
- **File:** `src/main.js`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T4.1

### T4.3 Filter tipe dan status
- **Deskripsi:** Filter tipe dan ketersediaan yang digabung dengan pencarian secara irisan (AND).
- **Acceptance criteria:**
  1. Filter tipe "Family" → hanya Bougenville dan Teratai; status "Tersedia" → hanya kamar `tersedia: true` (AC-6).
  2. Tipe "Family" + status "Tersedia" + pencarian "teratai" → hanya Kamar Teratai (AC-7).
  3. Kembali ke "Semua" mengembalikan kamar sesuai filter lain yang masih aktif.
- **File:** `src/main.js`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T4.2

### T4.4 Sorting
- **Deskripsi:** Urutan default (urutan data), harga termurah, harga termahal, nama A–Z. Sorting dilakukan pada salinan hasil, tidak mengubah urutan array state.
- **Acceptance criteria:**
  1. "Harga termurah" → 250.000, 275.000, 400.000, 450.000, 650.000, 700.000; "Harga termahal" → kebalikannya (AC-8).
  2. "Nama A–Z" → Anggrek, Bougenville, Cempaka, Kenanga, Melati, Teratai.
  3. Kembali ke "Urutan default" mengembalikan urutan data awal.
  4. Urutan di dashboard tidak ikut berubah akibat sorting katalog.
- **File:** `src/main.js`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T4.3

### T4.5 Empty state hasil kosong dan Reset filter
- **Deskripsi:** Bila hasil kosong tampil "Tidak ada kamar yang cocok" dengan tombol "Reset filter" yang mengosongkan pencarian, mengembalikan filter ke "Semua", dan sorting ke default (F-08).
- **Acceptance criteria:**
  1. Ketik "zzzz" → pesan kosong dan tombol Reset filter tampil (AC-9).
  2. Klik Reset filter → semua 6 kamar tampil, semua kontrol kembali ke nilai awal.
  3. Fokus pindah ke kolom pencarian setelah reset.
- **File:** `src/render.js`, `src/main.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T4.4

### T4.6 Penghitung hasil
- **Deskripsi:** Teks "Menampilkan X dari Y kamar" dengan `aria-live="polite"` (UI §6.7).
- **Acceptance criteria:**
  1. Angka X dan Y sesuai jumlah hasil dan total kamar setiap kali filter berubah.
  2. Teks tidak mengganggu tata letak di 360 px.
- **File:** `src/render.js`, `index.html`
- **Prioritas:** Should Have
- **Ketergantungan:** T4.3

**Selesai M4 bila:** AC-4 sampai AC-9 lolos.

---

## M5 — Integrasi WhatsApp

**Tujuan:** tombol booking membuka chat WhatsApp dengan pesan terisi (F-07).

### T5.1 Pembentuk URL dan pesan WhatsApp
- **Deskripsi:** Fungsi murni yang menerima satu kamar dan mengembalikan `https://wa.me/<nomor>?text=<pesan>`. Nomor diambil dari konstanta dan dinormalkan menjadi digit saja; pesan memakai format UI §6.9 dan di-encode dengan `encodeURIComponent`.
- **Acceptance criteria:**
  1. Untuk Kamar Melati, URL berawalan `https://wa.me/628120000000?text=` (sesuai nomor di konstanta) dan teks ter-decode memuat nama, tipe, "Rp250.000", dan "2 tamu" (AC-10).
  2. Nama dengan karakter khusus (`&`, `#`, spasi, baris baru) tidak merusak URL.
  3. Nomor pada URL sama dengan konstanta; tidak ada API key/token di source atau halaman (AC-12).
- **File:** `src/data.js`, `src/render.js` (atau fungsi pembantu di `src/main.js`)
- **Prioritas:** Must Have
- **Ketergantungan:** T3.4, T2.1

### T5.2 Tombol booking di kartu
- **Deskripsi:** Kamar tersedia → tautan bergaya tombol primer "Booking via WhatsApp" (`target="_blank"`, `rel="noopener noreferrer"`, `aria-label` menyebut nama kamar). Kamar tidak tersedia → tombol `disabled` "Tidak tersedia" (UI §6.9, §7.4).
- **Acceptance criteria:**
  1. Klik tombol di kamar tersedia membuka tab baru ke URL `wa.me` yang benar (AC-10); halaman StayEase tidak berganti.
  2. Kamar Anggrek dan Bougenville menampilkan tombol disabled dan tidak dapat diklik, disertai badge "– Tidak tersedia" (AC-11).
  3. Tautan dapat difokus dengan `Tab` dan diaktifkan dengan `Enter`.
- **File:** `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T5.1

### T5.3 Dokumentasi nomor placeholder
- **Deskripsi:** Pastikan komentar konfigurasi (T2.1) dan README (T10.3) menjelaskan cara mengganti nomor WhatsApp.
- **Acceptance criteria:**
  1. Cara mengganti nomor tertulis di komentar `data.js`.
  2. Mengganti nomor di satu konstanta mengubah URL pada semua tombol booking setelah refresh.
- **File:** `src/data.js`, `README.md`
- **Prioritas:** Should Have
- **Ketergantungan:** T5.2

**Selesai M5 bila:** AC-10 sampai AC-12 lolos. Verifikasi cukup memastikan URL dan pesan benar (R-04).

---

## M6 — Dashboard dan CRUD Kamar

**Tujuan:** pengelola dapat menambah, mengubah, menghapus kamar; hasil langsung tercermin dan tersimpan (F-09 – F-13, F-15, F-18).

### T6.1 Layout dashboard dan ringkasan
- **Deskripsi:** Judul, dua kartu ringkasan (Total kamar, Kamar tersedia) dengan `role="status"`, serta tombol aksi "Tambah kamar" (UI §6.10).
- **Acceptance criteria:**
  1. Dengan data awal: total = 6 dan tersedia = 4 (AC-13).
  2. Angka diperbarui segera setelah tambah/ubah/hapus tanpa reload.
  3. Angka dihitung dari state yang sama dengan katalog (N-07).
- **File:** `index.html`, `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T2.4, T3.2

### T6.2 Daftar kamar dashboard
- **Deskripsi:** Tabel di ≥ 768 px dan kartu ringkas di bawahnya; kolom Foto (thumbnail), Nama, Tipe, Harga, Kapasitas, Status, Aksi (UI §6.11). Setiap tombol aksi punya `aria-label` yang menyebut nama kamar.
- **Acceptance criteria:**
  1. Semua kamar dari state tampil dengan tombol Ubah dan Hapus (F-13).
  2. Di 360 px tidak ada scroll horizontal pada halaman; di 1280 px tampil sebagai tabel.
  3. `aria-label` berbunyi mis. "Ubah Kamar Melati" dan "Hapus Kamar Melati".
- **File:** `src/render.js`, `src/style.css`, `index.html`
- **Prioritas:** Must Have
- **Ketergantungan:** T6.1

### T6.3 Dialog form dan tambah kamar
- **Deskripsi:** `<dialog>` form dengan field Nama, Tipe, Harga, Kapasitas, Deskripsi (dengan penghitung), URL gambar, dan checkbox Tersedia (UI §4.3, §6.5, §6.12). `id` dibuat otomatis (mis. `kamar-<timestamp>` atau `crypto.randomUUID()`) dan tidak tampil. Simpan → mutasi → `save()` → `render()` → dialog tertutup.
- **Acceptance criteria:**
  1. Klik "Tambah kamar" membuka dialog dengan fokus di field Nama; `Esc` menutup dialog; fokus kembali ke tombol pemicu.
  2. Data valid → kamar baru muncul di daftar dashboard **dan** katalog; total bertambah 1 (AC-14).
  3. Dua kamar yang ditambahkan berurutan memiliki `id` berbeda.
  4. Setelah refresh, kamar baru masih ada (AC-18).
- **File:** `index.html`, `src/main.js`, `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T6.2, T2.4

### T6.4 Ubah kamar
- **Deskripsi:** Tombol Ubah membuka dialog yang sama dengan field terisi data lama dan judul "Ubah kamar"; simpan memperbarui kamar dengan `id` yang sama.
- **Acceptance criteria:**
  1. Field terisi nilai kamar terpilih (termasuk status Tersedia).
  2. Ubah nama dan harga → perubahan terlihat di dashboard dan katalog tanpa reload (AC-16).
  3. Jumlah kamar tidak berubah dan tidak ada duplikat; posisi urutan kamar tetap.
  4. Setelah refresh, perubahan masih ada (AC-18).
- **File:** `src/main.js`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T6.3

### T6.5 Hapus kamar dengan konfirmasi
- **Deskripsi:** Tombol Hapus membuka dialog konfirmasi (UI §4.4) yang menyebut nama kamar; tombol "Hapus" berwarna bahaya, "Batal" sebagai default fokus.
- **Acceptance criteria:**
  1. Konfirmasi muncul sebelum kamar dihapus.
  2. Klik "Hapus" → kamar hilang dari dashboard dan katalog, total berkurang 1 (AC-17).
  3. Klik "Batal" atau `Esc` → data tidak berubah (AC-17).
  4. Setelah refresh, kamar yang dihapus tidak muncul lagi (AC-18).
- **File:** `src/main.js`, `src/render.js`, `src/style.css`, `index.html`
- **Prioritas:** Must Have
- **Ketergantungan:** T6.2

### T6.6 Empty state dashboard
- **Deskripsi:** Bila koleksi kosong, dashboard menampilkan "Belum ada kamar di dashboard" dengan tombol "Tambah kamar" (dan "Reset data demo" bila T6.8 dikerjakan).
- **Acceptance criteria:**
  1. Setelah menghapus semua kamar, dashboard menampilkan empty state; total = 0 dan tersedia = 0; katalog menampilkan "Belum ada kamar".
  2. Menambah satu kamar dari empty state berfungsi normal.
- **File:** `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T6.5

### T6.7 Toggle ketersediaan cepat (F-15)
- **Deskripsi:** Tombol "Ubah status" di tiap baris dashboard membalik `tersedia` tanpa membuka form.
- **Acceptance criteria:**
  1. Klik pada kamar tersedia → menjadi "Tidak tersedia" di dashboard dan katalog; tombol booking di katalog menjadi disabled.
  2. Ringkasan "Kamar tersedia" berubah sesuai; perubahan bertahan setelah refresh.
- **File:** `src/main.js`, `src/render.js`
- **Prioritas:** Should Have
- **Ketergantungan:** T6.2

### T6.8 Reset data demo (F-18)
- **Deskripsi:** Tombol "Reset data demo" membuka dialog konfirmasi; setelah dikonfirmasi, state kembali ke 6 kamar contoh dan disimpan.
- **Acceptance criteria:**
  1. Setelah mengubah data, klik Reset → konfirmasi muncul; konfirmasi → 6 kamar contoh kembali (AC-19).
  2. Batal → data tidak berubah.
  3. Filter katalog tidak membuat data tampak hilang setelah reset.
- **File:** `src/main.js`, `src/render.js`, `index.html`
- **Prioritas:** Should Have
- **Ketergantungan:** T6.5, T2.3

**Selesai M6 bila:** AC-13 sampai AC-18 lolos (AC-19 bila T6.8 dikerjakan).

---

## M7 — Validasi dan Keamanan

**Tujuan:** menutup celah validasi dan keamanan (N-04, N-05, N-06, N-09, R-05).

### T7.1 Fungsi validasi kamar
- **Deskripsi:** Fungsi murni `validasiKamar(input)` yang mengembalikan daftar error per field sesuai SPEC 4.1: nama 1–60 (setelah trim), tipe ∈ daftar tipe, harga bilangan bulat ≥ 0, kapasitas bilangan bulat 1–10, deskripsi ≤ 300, `imageUrl` kosong/`/images/...`/`http(s)`. Nilai harga dan kapasitas dikonversi menjadi `number` saat disimpan.
- **Acceptance criteria:**
  1. Nama kosong atau hanya spasi → error; nama 61 karakter → error.
  2. Harga `-1`, `1.5`, atau kosong → error; harga `0` → valid.
  3. Kapasitas `0`, `11`, atau `1.5` → error; kapasitas `1` dan `10` → valid.
  4. Tipe di luar daftar (mis. diubah lewat DevTools) → error.
  5. `harga` dan `kapasitas` tersimpan sebagai tipe number di localStorage.
- **File:** `src/storage.js` (atau `src/data.js`)
- **Prioritas:** Must Have
- **Ketergantungan:** T2.3

### T7.2 Pesan validasi inline pada form
- **Deskripsi:** Tampilkan pesan sesuai UI §7.3 di bawah field yang salah dengan `aria-invalid` dan `aria-describedby`; fokus pindah ke field salah pertama; error hilang saat field diubah.
- **Acceptance criteria:**
  1. Simpan dengan nama kosong, harga negatif, atau kapasitas `0` → pesan muncul dan data tidak tersimpan (AC-15).
  2. Dialog tetap terbuka dan input pengguna tidak hilang.
  3. Pembaca layar/inspeksi DevTools menunjukkan `aria-invalid="true"` pada field bermasalah.
- **File:** `src/main.js`, `src/render.js`, `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T7.1, T6.3

### T7.3 Rendering aman (anti-XSS)
- **Deskripsi:** Audit seluruh kode render: input pengguna hanya masuk ke DOM lewat `textContent`, `setAttribute`, atau properti DOM; tidak ada `innerHTML`/`insertAdjacentHTML` yang memakai data pengguna.
- **Acceptance criteria:**
  1. Simpan kamar bernama `<img src=x onerror=alert(1)>` → teks tampil apa adanya di katalog, dashboard, dan dialog hapus; tidak ada alert (AC-20).
  2. Pencarian "src=x" menemukan kamar tersebut sebagai teks.
  3. Pencarian di source (`innerHTML`) tidak menemukan pemakaian dengan data pengguna.
- **File:** `src/render.js`, `src/main.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T6.3

### T7.4 Pengamanan `imageUrl`
- **Deskripsi:** Tolak skema selain `/images/...` dan `http(s)://` pada validasi (mis. `javascript:`); data dari localStorage yang tidak lolos validasi dipakai sebagai kosong (placeholder).
- **Acceptance criteria:**
  1. Mengisi `imageUrl` dengan `javascript:alert(1)` → pesan error validasi.
  2. Mengubah `imageUrl` di localStorage menjadi `javascript:alert(1)` lalu refresh → tidak ada eksekusi dan placeholder tampil.
- **File:** `src/storage.js`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T7.1

### T7.5 Pemeriksaan kredensial dan skrip
- **Deskripsi:** Pastikan tidak ada API key/token/secret di repo dan localStorage, dan `package.json` hanya berisi skrip aman.
- **Acceptance criteria:**
  1. Pencarian `key`, `token`, `secret` di repo tidak menemukan kredensial (N-04).
  2. Tidak ada berkas `.env` berisi rahasia; Application → Local Storage hanya berisi `stayease.kamar.v1`.
  3. `package.json` hanya memuat skrip `dev`, `build`, `preview`, dan tidak ada skrip yang menghapus file di luar proyek (N-09).
- **File:** `package.json`, seluruh repo (tinjauan)
- **Prioritas:** Must Have
- **Ketergantungan:** T6.3

### T7.6 Banner data rusak
- **Deskripsi:** Saat `load()` jatuh ke data contoh karena data rusak (bukan karena kosong), tampilkan banner peringatan "Data tersimpan tidak dapat dibaca. Data contoh dimuat." (UI §7.3).
- **Acceptance criteria:**
  1. Set key menjadi `{` lalu refresh → data contoh tampil dan banner muncul; tombol Tutup menyembunyikannya (AC-21).
  2. localStorage kosong (kunjungan pertama) → banner **tidak** muncul.
- **File:** `src/storage.js`, `src/main.js`, `src/render.js`, `src/style.css`
- **Prioritas:** Should Have
- **Ketergantungan:** T2.3

**Selesai M7 bila:** AC-12, 15, 20, 21 lolos dan butir keamanan Definition of Done terpenuhi.

---

## M8 — Responsive Design dan Accessibility

**Tujuan:** memenuhi N-02 dan N-03 serta UI §9.

### T8.1 Responsif 360–1440 px
- **Deskripsi:** Periksa dan rapikan seluruh tampilan (navbar, hero, toolbar, kartu, dashboard, dialog) di 360, 640, 768, 1024, dan 1440 px.
- **Acceptance criteria:**
  1. Tidak ada scroll horizontal halaman pada 360 px.
  2. Dialog form di 360 px dapat digulir dan tombol Simpan/Batal tetap terlihat.
  3. Di 1440 px kontainer tidak lebih lebar dari 1120 px dan tetap rata tengah.
- **File:** `src/style.css`, `index.html`
- **Prioritas:** Must Have
- **Ketergantungan:** M3–M6 selesai

### T8.2 Keyboard dan fokus
- **Deskripsi:** Pastikan semua kontrol dapat dicapai dengan `Tab`, memiliki cincin fokus terlihat, dialog mengunci fokus dan mengembalikannya, dan skip link berfungsi.
- **Acceptance criteria:**
  1. Menekan `Tab` dari awal halaman menampilkan skip link; `Enter` melompat ke `main`.
  2. Seluruh tombol, tautan, dan field menampilkan cincin fokus yang jelas.
  3. Semua alur utama (cari, filter, booking, tambah/ubah/hapus) dapat diselesaikan hanya dengan keyboard.
- **File:** `src/style.css`, `src/main.js`, `index.html`
- **Prioritas:** Must Have
- **Ketergantungan:** T8.1

### T8.3 Label, alt, landmark, dan aria-live
- **Deskripsi:** Audit label form, `alt` gambar, hierarki heading, `aria-current`, `aria-live` (penghitung, ringkasan, pesan sukses), dan `role="alert"` untuk error penyimpanan (UI §9).
- **Acceptance criteria:**
  1. Setiap input/select/textarea memiliki `<label>` yang terhubung.
  2. Setiap `<img>` memiliki `alt` (placeholder dekoratif boleh `alt=""` hanya bila bukan satu-satunya informasi).
  3. Hierarki heading tidak melompat tingkat.
- **File:** `index.html`, `src/render.js`
- **Prioritas:** Must Have
- **Ketergantungan:** T8.1

### T8.4 Kontras dan target sentuh
- **Deskripsi:** Verifikasi kontras pasangan warna UI §3.1 dengan DevTools dan pastikan target sentuh ≥ 44 px.
- **Acceptance criteria:**
  1. Teks normal memiliki kontras ≥ 4,5:1; komponen non-teks ≥ 3:1 (periksa lewat panel Accessibility/contrast di DevTools).
  2. Tombol, item navigasi, dan kontrol form memiliki tinggi ≥ 44 px.
- **File:** `src/style.css`
- **Prioritas:** Must Have
- **Ketergantungan:** T8.1

### T8.5 Dukungan `prefers-reduced-motion`
- **Deskripsi:** Nonaktifkan transisi dan scroll halus bila pengguna meminta gerak berkurang.
- **Acceptance criteria:**
  1. Dengan emulasi "prefers-reduced-motion: reduce" di DevTools, tidak ada transisi/animasi berjalan.
- **File:** `src/style.css`
- **Prioritas:** Should Have
- **Ketergantungan:** T8.1

**Selesai M8 bila:** N-02 dan N-03 terpenuhi pada pemeriksaan manual.

---

## M9 — Testing Manual

**Tujuan:** memastikan seluruh perilaku sesuai SPEC, bukan sekadar "terlihat jalan" (R-09). Testing otomatis di luar scope.

### T9.1 Jalankan seluruh acceptance criteria SPEC
- **Deskripsi:** Pada `npm run dev` dengan localStorage dibersihkan sebelum skenario pertama, jalankan AC-1 sampai AC-23 berurutan dan isi checklist di bagian bawah dokumen ini.
- **Acceptance criteria:**
  1. Seluruh AC `W` (1–18, 20–23) tercentang lolos.
  2. AC-19 diperiksa bila T6.8 dikerjakan.
  3. Setiap kegagalan dicatat (nomor AC + langkah) lalu diperbaiki dan diuji ulang.
- **File:** `TASKS.md` (centang checklist)
- **Prioritas:** Must Have
- **Ketergantungan:** M1–M8 selesai

### T9.2 Uji lintas ukuran layar
- **Deskripsi:** Gunakan Device Toolbar pada 360, 768, dan 1440 px; uji katalog, dashboard, dan dialog.
- **Acceptance criteria:**
  1. Tidak ada elemen terpotong atau tumpang tindih pada ketiga ukuran.
  2. Alur CRUD lengkap dapat dilakukan di 360 px.
- **File:** — (pemeriksaan)
- **Prioritas:** Must Have
- **Ketergantungan:** T9.1

### T9.3 Uji offline dan kinerja
- **Deskripsi:** Muat halaman, matikan jaringan (DevTools → Offline), lalu uji lihat/cari/filter/CRUD; ukur waktu muat dan render.
- **Acceptance criteria:**
  1. Setelah halaman terbuka, semua fungsi inti tetap berjalan saat offline (N-10).
  2. Muat awal < 2 detik dan render ulang katalog < 200 ms (N-01).
  3. Tidak ada permintaan jaringan ke domain eksternal di tab Network.
- **File:** — (pemeriksaan)
- **Prioritas:** Must Have
- **Ketergantungan:** T9.1

### T9.4 Uji dengan 50 kamar
- **Deskripsi:** Isi localStorage dengan 50 kamar lewat skrip di console DevTools (bukan skrip proyek), lalu uji pencarian, filter, sorting, dan render dashboard.
- **Acceptance criteria:**
  1. 50 kamar tampil tanpa jeda terasa saat mengetik pencarian (N-01).
  2. Reset data demo atau menghapus key mengembalikan 6 kamar contoh.
- **File:** —
- **Prioritas:** Should Have
- **Ketergantungan:** T9.3

### T9.5 Perbaikan temuan
- **Deskripsi:** Perbaiki bug dari T9.1–T9.4 dan ulangi AC yang terdampak.
- **Acceptance criteria:**
  1. Tidak ada AC `W` yang masih gagal.
  2. Tidak ada error merah di console pada alur normal.
- **File:** sesuai temuan
- **Prioritas:** Must Have
- **Ketergantungan:** T9.1–T9.3

**Selesai M9 bila:** semua AC `W` lolos.

---

## M10 — Build dan Verifikasi Akhir

**Tujuan:** build produksi bersih dan Definition of Done terpenuhi (AC-24).

### T10.1 `npm run build`
- **Deskripsi:** Jalankan build produksi dan pastikan tidak ada error maupun peringatan aset hilang.
- **Acceptance criteria:**
  1. `npm run build` selesai tanpa error dan menghasilkan folder `dist/` (AC-24).
  2. `dist/images/` memuat 6 gambar dan placeholder.
- **File:** `vite.config.js` (hanya bila diperlukan), `package.json`
- **Prioritas:** Must Have
- **Ketergantungan:** M9

### T10.2 Preview hasil build
- **Deskripsi:** Jalankan `npm run preview` dan periksa alur utama dari localStorage bersih.
- **Acceptance criteria:**
  1. Tidak ada error console terkait aset yang hilang (AC-24).
  2. Katalog, filter, WhatsApp, dan CRUD berfungsi seperti pada mode dev.
  3. Mode incognito: aplikasi memuat data contoh tanpa error (AC-23).
- **File:** —
- **Prioritas:** Must Have
- **Ketergantungan:** T10.1

### T10.3 README singkat
- **Deskripsi:** Tulis README berisi cara menjalankan (`npm install`, `npm run dev`, `npm run build`), cara mengganti nomor WhatsApp, struktur folder, dan catatan bahwa data hanya tersimpan lokal di browser.
- **Acceptance criteria:**
  1. Orang lain dapat menjalankan aplikasi hanya dengan mengikuti README.
  2. Cara mengganti nomor WhatsApp dan keterbatasan `wa.me` (R-03, R-04) tertulis.
- **File:** `README.md`
- **Prioritas:** Should Have
- **Ketergantungan:** T10.1

### T10.4 Tinjauan akhir Definition of Done
- **Deskripsi:** Centang seluruh Definition of Done, lalu commit hasil akhir.
- **Acceptance criteria:**
  1. Semua butir Definition of Done di bawah tercentang.
  2. Tidak ada fitur di luar scope yang ikut ditambahkan.
- **File:** `TASKS.md`
- **Prioritas:** Must Have
- **Ketergantungan:** T10.2

---

## Definition of Done

- [ ] Seluruh AC `W` (1–18, 20–23) lolos manual
- [ ] Tidak ada API key/token/secret di repo maupun localStorage
- [ ] `npm run build` sukses tanpa error (AC-24)
- [ ] Data contoh 6 kamar nonpribadi; nomor WhatsApp placeholder terdokumentasi
- [ ] Desain mengikuti `UI-SPEC.md` (warna, font, komponen, state)
- [ ] README singkat tersedia (disarankan)

## Checklist Acceptance Criteria

| AC | Deskripsi singkat | Tugas terkait | Lolos |
| --- | --- | --- | --- |
| 1 | Tepat 6 kamar contoh saat localStorage kosong | T2.3, T3.4 | [ ] |
| 2 | Refresh tidak menduplikasi data | T2.4 | [ ] |
| 3 | Harga 0 tampil "Rp0" | T3.4 | [ ] |
| 4 | Pencarian case-insensitive | T4.2 | [ ] |
| 5 | Pencarian cocok tipe dan deskripsi | T4.2 | [ ] |
| 6 | Filter tipe dan status | T4.3 | [ ] |
| 7 | Kombinasi filter + pencarian | T4.3 | [ ] |
| 8 | Sorting harga dan nama | T4.4 | [ ] |
| 9 | Empty state + reset filter | T4.5 | [ ] |
| 10 | URL `wa.me` dengan pesan lengkap | T5.1, T5.2 | [ ] |
| 11 | Tombol nonaktif untuk kamar tidak tersedia | T5.2 | [ ] |
| 12 | Nomor WA sesuai konstanta, tanpa key/token | T5.1, T7.5 | [ ] |
| 13 | Ringkasan total 6 dan tersedia 4 | T6.1 | [ ] |
| 14 | Tambah kamar valid | T6.3 | [ ] |
| 15 | Validasi form | T7.1, T7.2 | [ ] |
| 16 | Ubah kamar | T6.4 | [ ] |
| 17 | Hapus dengan konfirmasi | T6.5 | [ ] |
| 18 | Perubahan bertahan setelah refresh | T6.3–T6.5 | [ ] |
| 19 | Reset data demo (Should Have) | T6.8 | [ ] |
| 20 | Uji XSS | T7.3 | [ ] |
| 21 | JSON rusak → fallback data contoh | T2.3, T7.6 | [ ] |
| 22 | Placeholder untuk gambar kosong/invalid | T3.5 | [ ] |
| 23 | Incognito/clear storage tanpa error | T2.5, T10.2 | [ ] |
| 24 | `npm run build` sukses | T10.1, T10.2 | [ ] |

## Risiko yang Dipantau

| Risiko | Milestone | Tindakan |
| --- | --- | --- |
| R-01 Scope creep | Semua | Patuhi SPEC Bagian 7 dan UI §11; kerjakan Should Have setelah Must Have lolos |
| R-02 Data localStorage hilang | M2, M10 | Footer demo (UI §6.15), README, tombol reset |
| R-03/R-04 Nomor `wa.me` placeholder | M5 | Satu konstanta; cukup verifikasi URL dan pesan |
| R-05 XSS | M3, M6, M7 | `textContent`/DOM API; uji AC-20 |
| R-06 Gambar tidak ditemukan | M3 | `onerror` → placeholder; uji AC-22 |
| R-07 Waktu habis | M6 | Katalog lebih dulu, dashboard setelahnya; Should Have ditunda |
| R-09 Keluaran AI tidak sesuai SPEC | M9 | Periksa tiap milestone terhadap AC, bukan hanya tampilan |

## Urutan Penundaan Bila Waktu Mepet

Tunda dalam urutan ini (dari yang pertama ditunda): T9.4 → T8.5 → T10.3 → T6.8 → T6.7 → T7.6 → T4.6 → T3.7 → T3.3 → T2.5. Semua tugas Must Have tidak boleh ditunda.
