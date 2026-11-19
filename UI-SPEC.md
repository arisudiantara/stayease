# UI-SPEC — StayEase

Spesifikasi antarmuka untuk aplikasi **StayEase** (katalog dan booking kamar homestay via WhatsApp + dashboard demo pengelola).
Dokumen ini turunan dari `SPEC.md` v1.0 dan **mengikat** bagi implementasi UI.

| Item | Nilai |
| --- | --- |
| Gaya | Modern, minimalis, elegan |
| Palet | Krem hangat + hijau rempah |
| Font | Sans-serif (system font stack, tanpa unduhan font eksternal) |
| Pendekatan | Mobile-first (basis 360 px → 1440 px) |
| Stack UI | HTML + CSS + JavaScript vanilla, tanpa framework dan tanpa library UI (N-08) |
| Status dokumen | Hanya desain. **Tidak berisi kode HTML/CSS/JS.** |

---

## 1. Prinsip Desain

1. **Hangat dan tenang.** Latar krem, aksen hijau rempah, banyak ruang kosong, sudut membulat lembut.
2. **Satu aksi utama per area.** Tombol hijau penuh hanya untuk aksi utama (Booking, Simpan, Tambah kamar).
3. **Informasi tidak bergantung pada warna saja.** Status selalu memakai teks (dan ikon), bukan hanya warna.
4. **Mobile-first.** Rancang di 360 px lebih dulu; layar besar menambah kolom, bukan fitur.
5. **Offline-first.** Tanpa font, gambar, atau skrip dari layanan eksternal (F-02, N-10). Ikon berupa SVG inline.
6. **Hanya yang ada di SPEC.** Tidak ada login, tanggal check-in/out, rating, peta, upload gambar, atau multi-bahasa (SPEC Bagian 7).

---

## 2. Struktur Halaman dan Navigasi

Satu halaman (single-page) dengan dua tampilan yang ditukar tanpa reload dan tanpa routing server (F-14).

```
index.html
├─ Skip link ("Lewati ke konten utama")
├─ Navbar (sticky)
│   ├─ Brand "StayEase"
│   └─ Navigasi: [Katalog] [Dashboard]
├─ <main>
│   ├─ Tampilan KATALOG (default)
│   │   ├─ Hero
│   │   ├─ Toolbar: pencarian, filter tipe, filter status, sorting
│   │   ├─ Penghitung hasil
│   │   └─ Grid kartu kamar  (atau empty state)
│   └─ Tampilan DASHBOARD
│       ├─ Judul + ringkasan (total, tersedia)
│       ├─ Aksi: [Tambah kamar] [Reset data demo (S)]
│       └─ Daftar kamar (tabel desktop / kartu mobile)
├─ Footer kecil (catatan demo)
└─ Dialog (native <dialog>): Form kamar, Konfirmasi hapus, Konfirmasi reset (S)
```

Aturan navigasi:
- Navbar hanya memiliki **dua item**, jadi **tanpa hamburger menu**; keduanya tetap terlihat di 360 px.
- Item aktif ditandai `aria-current="page"`, warna hijau tebal, dan garis bawah (bukan warna saja).
- Hero hanya tampil di tampilan Katalog.
- Pindah tampilan memindahkan fokus ke judul `<h1>`/`<h2>` tampilan tujuan dan menggulir ke atas.
- Filter, pencarian, dan sorting **tidak disimpan**; kembali ke default saat halaman dimuat ulang.

---

## 3. Design Tokens

Seluruh nilai dideklarasikan sekali sebagai CSS custom property di `:root` (di `style.css`). Rasio kontras di bawah adalah perkiraan hitungan WCAG; **verifikasi ulang dengan DevTools** saat implementasi.

### 3.1 Warna

**Permukaan dan garis**

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `--cream-50` | `#FBF7EF` | Latar halaman |
| `--cream-100` | `#F4ECDC` | Latar hero, header tabel, panel sekunder |
| `--cream-200` | `#E8DCC2` | Garis halus, latar badge netral, latar elemen disabled |
| `--surface` | `#FFFDF8` | Kartu, dialog, input |
| `--border-strong` | `#857F6C` | Batas input dan kontrol (kontras ≥ 3:1) |

**Teks**

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `--ink-900` | `#26241E` | Teks utama dan judul |
| `--ink-700` | `#4A463B` | Teks sekunder |
| `--ink-500` | `#6B6657` | Teks bantu/placeholder (jangan dipakai di atas `--cream-200`) |

**Hijau rempah (aksen utama)**

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `--green-700` | `#2F4A31` | Hover/pressed tombol, teks di atas tint hijau, tautan |
| `--green-600` | `#3E5F3F` | Tombol primer, item navigasi aktif |
| `--green-100` | `#E4EBD9` | Latar badge "Tersedia", sorotan lembut |
| `--green-50` | `#F0F4E8` | Latar ringkasan/hover baris |

**Semantik**

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `--red-700` | `#9F2A2A` | Teks error, tombol Hapus |
| `--red-100` | `#F7E1DD` | Latar pesan error |
| `--amber-700` | `#8A4B0F` | Teks peringatan |
| `--amber-100` | `#FBEBD0` | Latar peringatan |
| `--focus` | `#1D4ED8` | Cincin fokus keyboard |

**Pasangan warna dan kontras (perkiraan)**

| Teks/Elemen | Latar | Rasio | Lolos |
| --- | --- | --- | --- |
| `--ink-900` | `--cream-50` | ≈ 14 : 1 | AA / AAA |
| `--ink-700` | `--cream-50` | ≈ 8,8 : 1 | AA / AAA |
| `--ink-500` | `--cream-50` | ≈ 5,3 : 1 | AA |
| `--ink-500` | `--cream-100` | ≈ 4,8 : 1 | AA |
| Putih `#FFFFFF` | `--green-600` | ≈ 7,2 : 1 | AA / AAA |
| Putih `#FFFFFF` | `--green-700` | ≈ 9,8 : 1 | AA / AAA |
| `--green-700` | `--green-100` | ≈ 8 : 1 | AA / AAA |
| `--ink-700` | `--cream-200` | ≈ 6,9 : 1 | AA |
| `--red-700` | `--cream-50` | ≈ 6,9 : 1 | AA |
| `--red-700` | `--red-100` | ≈ 6 : 1 | AA |
| `--amber-700` | `--amber-100` | ≈ 5,8 : 1 | AA |
| `--border-strong` | `--surface` | ≈ 3,9 : 1 | AA (non-teks, ≥ 3:1) |
| `--focus` | `--cream-50` | ≈ 6,3 : 1 | AA (non-teks, ≥ 3:1) |

Aturan:
- Teks normal minimal 4,5:1; teks besar (≥ 24 px, atau ≥ 18,5 px tebal) dan komponen non-teks minimal 3:1.
- Elemen `disabled` dikecualikan dari persyaratan kontras, tetapi tetap ditargetkan ≥ 3:1 agar terbaca.
- Jangan memakai warna sebagai satu-satunya pembeda (status, error, item aktif).

### 3.2 Tipografi

Font: **sans-serif system stack** (tanpa unduhan, selaras N-10).

```
--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Token | Ukuran | Berat | Line-height | Pemakaian |
| --- | --- | --- | --- | --- |
| `--text-display` | `clamp(1.875rem, 6vw, 2.75rem)` | 700 | 1.15 | Judul hero (`h1`) |
| `--text-h2` | `clamp(1.375rem, 3.5vw, 1.75rem)` | 700 | 1.25 | Judul section |
| `--text-h3` | `1.125rem` (18 px) | 600 | 1.3 | Nama kamar, judul dialog |
| `--text-base` | `1rem` (16 px) | 400 | 1.6 | Teks isi, input |
| `--text-sm` | `0.875rem` (14 px) | 400 / 500 | 1.5 | Meta, label, badge, bantuan |
| `--text-price` | `1.25rem` (20 px) | 700 | 1.2 | Harga di kartu |

Aturan: ukuran input minimal 16 px (mencegah zoom otomatis di iOS); judul tidak melewati 2 baris di 360 px; panjang baris teks isi maksimal ±65 karakter.

### 3.3 Spacing (kelipatan 4 px)

| Token | Nilai | Token | Nilai |
| --- | --- | --- | --- |
| `--space-1` | 4 px | `--space-6` | 24 px |
| `--space-2` | 8 px | `--space-8` | 32 px |
| `--space-3` | 12 px | `--space-12` | 48 px |
| `--space-4` | 16 px | `--space-16` | 64 px |
| `--space-5` | 20 px | | |

### 3.4 Radius, bayangan, gerak

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `--radius-sm` | 6 px | Badge, input kecil |
| `--radius-md` | 10 px | Tombol, input |
| `--radius-lg` | 16 px | Kartu, dialog, hero |
| `--radius-full` | 999 px | Chip/pill status |
| `--shadow-sm` | `0 1px 2px rgba(38,36,30,.08)` | Kartu default |
| `--shadow-md` | `0 4px 12px rgba(38,36,30,.10)` | Kartu hover, navbar saat tergulir |
| `--shadow-lg` | `0 12px 32px rgba(38,36,30,.20)` | Dialog |
| `--motion` | `150ms ease-out` | Hover, fokus, transisi kecil |

Dengan `prefers-reduced-motion: reduce`: semua transisi dan scroll halus dimatikan.

### 3.5 Breakpoint dan layout

| Nama | Lebar min | Perilaku |
| --- | --- | --- |
| Base (mobile) | 360 px | 1 kolom, padding sisi 16 px |
| `sm` | 640 px | Grid kartu 2 kolom, padding sisi 24 px |
| `md` | 768 px | Toolbar satu baris, dashboard memakai tabel |
| `lg` | 1024 px | Grid kartu 3 kolom, padding sisi 32 px |
| `xl` | 1440 px | Kontainer tetap, tidak melebar |

- Lebar kontainer maksimum **1120 px**, rata tengah.
- Jarak antar kartu `--space-4` (mobile) dan `--space-6` (≥ `sm`).
- Tidak boleh ada scroll horizontal pada halaman di 360 px (N-02). Tabel yang lebar discroll di dalam wadahnya sendiri.

---

## 4. Wireframe Mobile (360 px)

### 4.1 Katalog

```
┌────────────────────────────────────┐
│ StayEase        [Katalog][Dashboard]│  ← navbar sticky, 56 px
├────────────────────────────────────┤
│                                    │
│  Menginap nyaman,                  │
│  pesan lewat WhatsApp              │  ← h1 hero
│  Pilih kamar homestay yang cocok,  │
│  lalu hubungi pengelola langsung.  │
│  [ Lihat kamar ]                   │
│                                    │
├────────────────────────────────────┤
│  Katalog kamar                     │  ← h2
│                                    │
│  Cari kamar                        │
│  ┌──────────────────────────────┐  │
│  │ (ikon) Nama, tipe, deskripsi │  │
│  └──────────────────────────────┘  │
│  Tipe              Ketersediaan    │
│  ┌───────────────┐ ┌─────────────┐ │
│  │ Semua tipe  ▾ │ │ Semua     ▾ │ │
│  └───────────────┘ └─────────────┘ │
│  Urutkan                           │
│  ┌──────────────────────────────┐  │
│  │ Urutan default             ▾ │  │
│  └──────────────────────────────┘  │
│                                    │
│  Menampilkan 6 dari 6 kamar        │  ← aria-live
│                                    │
│  ┌──────────────────────────────┐  │
│  │ ┌──────────────────────────┐ │  │
│  │ │        [ foto 4:3 ]      │ │  │
│  │ └──────────────────────────┘ │  │
│  │ Kamar Melati                 │  │
│  │ (Standard)  (✓ Tersedia)     │  │
│  │ Rp250.000 / malam            │  │
│  │ 2 tamu                       │  │
│  │ Kasur double dan kipas angin │  │
│  │ ┌──────────────────────────┐ │  │
│  │ │  Booking via WhatsApp    │ │  │
│  │ └──────────────────────────┘ │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [ foto ]  Kamar Anggrek      │  │
│  │ (Standard) (– Tidak tersedia)│  │
│  │ Rp275.000 / malam · 2 tamu   │  │
│  │ ┌──────────────────────────┐ │  │
│  │ │ Tidak tersedia (disabled)│ │  │
│  │ └──────────────────────────┘ │  │
│  └──────────────────────────────┘  │
│   ... (4 kartu lain, 1 kolom)      │
├────────────────────────────────────┤
│ Aplikasi demo. Data kamar disimpan │
│ di browser ini.                    │
└────────────────────────────────────┘
```

### 4.2 Dashboard

```
┌────────────────────────────────────┐
│ StayEase        [Katalog][Dashboard]│
├────────────────────────────────────┤
│  Dashboard pengelola               │  ← h2
│  Kelola data kamar homestay.       │
│                                    │
│  ┌────────────┐  ┌────────────┐    │
│  │ Total kamar│  │ Tersedia   │    │
│  │     6      │  │     4      │    │
│  └────────────┘  └────────────┘    │
│                                    │
│  [ + Tambah kamar ]                │
│  [ Reset data demo ]   (S)         │
│                                    │
│  Daftar kamar                      │
│  ┌──────────────────────────────┐  │
│  │ [thumb] Kamar Melati         │  │
│  │ Standard · Rp250.000 · 2 tamu│  │
│  │ (✓ Tersedia)                 │  │
│  │ [Ubah] [Hapus] [Ubah status] │  │  ← "Ubah status" = F-15 (S)
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [thumb] Kamar Anggrek        │  │
│  │ ...                          │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### 4.3 Dialog Form (tambah/ubah) — mobile

Dialog hampir penuh layar (lebar 100%, maks tinggi 92 vh, isi bisa di-scroll, header dan tombol aksi tetap terlihat).

```
┌────────────────────────────────────┐
│ Tambah kamar                    [✕]│
├────────────────────────────────────┤
│ Nama kamar *                       │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ └────────────────────────────────┘ │
│ ⚠ Nama wajib diisi (1–60 karakter) │  ← error inline
│ Tipe *                             │
│ ┌────────────────────────────────┐ │
│ │ Standard                     ▾ │ │
│ └────────────────────────────────┘ │
│ Harga per malam (Rp) *             │
│ ┌────────────────────────────────┐ │
│ │ 0                              │ │
│ └────────────────────────────────┘ │
│ Kapasitas (tamu, 1–10) *           │
│ ┌────────────────────────────────┐ │
│ │ 1                              │ │
│ └────────────────────────────────┘ │
│ Deskripsi            0 / 300       │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ └────────────────────────────────┘ │
│ URL gambar                         │
│ ┌────────────────────────────────┐ │
│ │ /images/kamar-1.jpg            │ │
│ └────────────────────────────────┘ │
│ Kosongkan untuk memakai placeholder│
│ [x] Tersedia untuk dibooking       │
├────────────────────────────────────┤
│ [ Batal ]            [ Simpan ]    │  ← sticky di bawah
└────────────────────────────────────┘
```

### 4.4 Dialog Konfirmasi Hapus

```
┌────────────────────────────────┐
│ Hapus kamar?                   │
│ "Kamar Melati" akan dihapus    │
│ dari katalog dan dashboard.    │
│ Tindakan ini tidak dapat       │
│ dibatalkan.                    │
│                                │
│ [ Batal ]        [ Hapus ]     │  ← Hapus = tombol bahaya
└────────────────────────────────┘
```

---

## 5. Wireframe Desktop (1280 px, kontainer 1120 px)

### 5.1 Katalog

```
┌──────────────────────────────────────────────────────────────────────────┐
│ StayEase                                          [Katalog]  [Dashboard] │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Menginap nyaman, pesan lewat WhatsApp                             │  │
│  │  Pilih kamar homestay yang cocok, lalu hubungi pengelola langsung. │  │
│  │  [ Lihat kamar ]                                                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Katalog kamar                                                           │
│  Cari kamar                  Tipe          Ketersediaan    Urutkan       │
│  ┌────────────────────────┐ ┌───────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ (ikon) Nama, tipe, …   │ │Semua tipe▾│ │ Semua     ▾ │ │ Default  ▾│ │
│  └────────────────────────┘ └───────────┘ └─────────────┘ └───────────┘ │
│  Menampilkan 6 dari 6 kamar                                              │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │   [ foto 4:3 ]   │  │   [ foto 4:3 ]   │  │   [ foto 4:3 ]   │        │
│  │ Kamar Melati     │  │ Kamar Anggrek    │  │ Kamar Kenanga    │        │
│  │ (Standard)(✓Ada) │  │ (Standard)(–Tdk) │  │ (Deluxe)(✓Ada)   │        │
│  │ Rp250.000/malam  │  │ Rp275.000/malam  │  │ Rp400.000/malam  │        │
│  │ 2 tamu           │  │ 2 tamu           │  │ 2 tamu           │        │
│  │ [Booking via WA] │  │ [Tidak tersedia] │  │ [Booking via WA] │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Kamar Cempaka    │  │ Kamar Bougenville│  │ Kamar Teratai    │        │
│  │ ...              │  │ ...              │  │ ...              │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
├──────────────────────────────────────────────────────────────────────────┤
│  Aplikasi demo. Data kamar disimpan di browser ini.                      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard

```
┌──────────────────────────────────────────────────────────────────────────┐
│ StayEase                                          [Katalog]  [Dashboard] │
├──────────────────────────────────────────────────────────────────────────┤
│  Dashboard pengelola                    [Reset data demo (S)] [+ Tambah] │
│  Kelola data kamar homestay.                                             │
│                                                                          │
│  ┌──────────────────────┐ ┌──────────────────────┐                       │
│  │ Total kamar      6   │ │ Kamar tersedia   4   │                       │
│  └──────────────────────┘ └──────────────────────┘                       │
│                                                                          │
│  Daftar kamar                                                            │
│  ┌──────┬──────────────────┬──────────┬────────────┬─────┬──────┬──────┐ │
│  │ Foto │ Nama             │ Tipe     │ Harga      │ Kap.│Status│ Aksi │ │
│  ├──────┼──────────────────┼──────────┼────────────┼─────┼──────┼──────┤ │
│  │ [img]│ Kamar Melati     │ Standard │ Rp250.000  │ 2   │✓ Ada │Ubah  │ │
│  │      │                  │          │            │     │      │Hapus │ │
│  │      │                  │          │            │     │      │Status│ │
│  ├──────┼──────────────────┼──────────┼────────────┼─────┼──────┼──────┤ │
│  │ ...  │ ...              │ ...      │ ...        │ ... │ ...  │ ...  │ │
│  └──────┴──────────────────┴──────────┴────────────┴─────┴──────┴──────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Dialog Form — desktop

Dialog terpusat, lebar 560 px, overlay `rgba(38,36,30,.5)`. Field **Nama** dan **Tipe** berdampingan; **Harga** dan **Kapasitas** berdampingan; sisanya satu kolom. Tombol Batal dan Simpan rata kanan.

---

## 6. Komponen UI

### 6.1 Navbar
- Tinggi 56 px (mobile) / 64 px (desktop), latar `--surface`, garis bawah 1 px `--cream-200`; sticky; `--shadow-md` saat halaman tergulir.
- Brand "StayEase" (teks, berat 700, warna `--green-700`), tautan kembali ke tampilan Katalog.
- Item navigasi: tinggi sentuh ≥ 44 px. Aktif = teks `--green-700` tebal + garis bawah 3 px `--green-600`.

### 6.2 Hero
- Latar `--cream-100`, radius `--radius-lg`, padding `--space-6` (mobile) / `--space-12` (desktop).
- Isi: `h1`, satu paragraf pendek, satu tombol primer "Lihat kamar" yang menggulir ke toolbar katalog.
- Dekorasi hanya berupa bentuk CSS/SVG inline sederhana (tanpa gambar eksternal).

### 6.3 Tombol

| Varian | Tampilan | Pemakaian |
| --- | --- | --- |
| Primer | Latar `--green-600`, teks putih; hover `--green-700` | Booking via WhatsApp, Simpan, Tambah kamar, Lihat kamar |
| Sekunder | Latar `--surface`, batas 1,5 px `--green-600`, teks `--green-700` | Ubah, Batal, Reset data demo, Reset filter |
| Bahaya | Latar `--red-700`, teks putih | Hapus (di dialog konfirmasi) |
| Ghost/teks | Tanpa latar, teks `--green-700`, garis bawah saat hover | Aksi tersier di baris dashboard (Ubah status) |

Ukuran: tinggi minimum **44 px**, padding horizontal `--space-4`, radius `--radius-md`, teks 16 px berat 600. Tombol aksi di kartu berlebar penuh.

Status tombol: default, hover, `:focus-visible` (cincin 3 px `--focus`, offset 2 px), active (sedikit lebih gelap), **disabled** (latar `--cream-200`, teks `--ink-500`, kursor `not-allowed`, tanpa hover).

### 6.4 Badge
- Bentuk pil (`--radius-full`), teks 14 px berat 500, padding `4px 10px`.
- **Tipe**: batas 1 px `--green-600`, teks `--green-700`, latar `--surface`.
- **Tersedia**: latar `--green-100`, teks `--green-700`, awalan "✓".
- **Tidak tersedia**: latar `--cream-200`, teks `--ink-700`, awalan "–".

### 6.5 Field formulir (label + kontrol + bantuan + error)
- Label selalu terlihat di atas kontrol (bukan placeholder-saja) dan terhubung lewat `for`/`id` (N-03).
- Input/select/textarea: tinggi ≥ 44 px, latar `--surface`, batas 1,5 px `--border-strong`, radius `--radius-md`, teks 16 px.
- Fokus: batas `--green-600` + cincin 3 px `--focus`.
- Error: batas `--red-700`, pesan di bawah kontrol (teks 14 px `--red-700`, ikon "⚠"), `aria-invalid="true"`, `aria-describedby` menunjuk pesan.
- Penanda wajib: tanda `*` dan kata "wajib" dalam teks label atau bantuan.

### 6.6 Kolom pencarian
- Ikon kaca pembesar SVG inline (dekoratif, `aria-hidden`) di kiri; `type="search"`; label terlihat "Cari kamar".
- Memfilter langsung saat mengetik (tanpa tombol kirim); cocok pada nama, tipe, deskripsi, tidak peka huruf besar/kecil (F-04).

### 6.7 Toolbar katalog
- Mobile: pencarian (baris penuh) → tipe + ketersediaan (2 kolom) → urutkan (baris penuh).
- ≥ `md`: satu baris dengan grid `2fr 1fr 1fr 1fr`.
- Opsi:
  - **Tipe:** "Semua tipe" + tiap tipe yang ada (Standard, Deluxe, Family).
  - **Ketersediaan:** "Semua", "Tersedia", "Tidak tersedia".
  - **Urutkan:** "Urutan default", "Harga termurah", "Harga termahal", "Nama A–Z".
- Penghitung "Menampilkan X dari Y kamar" di bawah toolbar, `role="status"` / `aria-live="polite"`.

### 6.8 Kartu kamar
- Latar `--surface`, radius `--radius-lg`, batas 1 px `--cream-200`, `--shadow-sm`; hover `--shadow-md` (tanpa menggeser tata letak).
- Urutan isi (atas ke bawah): gambar (rasio 4:3, `object-fit: cover`, `alt` = "Foto <nama kamar>") → `h3` nama → baris badge (tipe, status) → harga → kapasitas → deskripsi (maks 2 baris, dipotong dengan elipsis) → tombol aksi.
- Format harga: `Rp250.000` diikuti teks kecil "/ malam"; harga `0` tampil `Rp0` (AC-3).
- Kapasitas: "2 tamu".
- Kamar tidak tersedia: gambar tetap normal (tanpa filter abu-abu yang menurunkan kontras), tombol berstatus disabled bertuliskan "Tidak tersedia" (AC-11).
- Mobile: kartu 1 kolom, gambar di atas. Layar `sm` ke atas: 2–3 kolom.

### 6.9 Tombol booking WhatsApp
- Kamar tersedia: elemen **tautan** (`<a>`) bergaya tombol primer, teks "Booking via WhatsApp", `target="_blank"` dengan `rel="noopener noreferrer"`, tujuan `https://wa.me/<nomor>?text=<pesan ter-encode>` (F-07, AC-10).
- Kamar tidak tersedia: elemen **tombol** `disabled` bertuliskan "Tidak tersedia", tidak dapat diklik (AC-11).
- Pesan WhatsApp (diisi otomatis, contoh):

```
Halo, saya tertarik memesan kamar berikut:
- Kamar: Kamar Melati
- Tipe: Standard
- Harga: Rp250.000 per malam
- Kapasitas: 2 tamu
Apakah kamar ini masih tersedia?
```

### 6.10 Kartu ringkasan (dashboard)
- Dua kartu: "Total kamar" dan "Kamar tersedia", angka besar (28 px, berat 700, `--green-700`), latar `--green-50`, batas 1 px `--cream-200`.
- Diperbarui langsung setelah tambah/ubah/hapus/toggle (F-09, N-07).
- Wadah memakai `role="status"` agar perubahan angka diumumkan pembaca layar.

### 6.11 Daftar kamar dashboard
- **≥ `md`**: tabel dengan kolom Foto (thumbnail 48 px), Nama, Tipe, Harga, Kapasitas, Status, Aksi. Header `--cream-100`; baris bergaris `--cream-200`; hover `--green-50`. Wadah tabel `overflow-x: auto` bila sempit.
- **< `md`**: setiap kamar menjadi kartu ringkas (thumbnail, nama, meta, badge, deretan tombol).
- Aksi per kamar: **Ubah** (sekunder), **Hapus** (sekunder dengan teks `--red-700`; konfirmasi memakai tombol bahaya di dialog), **Ubah status** (ghost, hanya bila F-15 dikerjakan).
- Setiap tombol aksi memiliki `aria-label` yang menyebut nama kamar, mis. "Ubah Kamar Melati", "Hapus Kamar Melati".

### 6.12 Dialog (form dan konfirmasi)
- Memakai elemen `<dialog>` native dengan `showModal()`: fokus terkunci di dalam dialog, `Esc` menutup, latar belakang tidak dapat diinteraksi.
- Header: judul (`h2`, dihubungkan ke dialog lewat `aria-labelledby`) + tombol tutup "✕" (`aria-label="Tutup"`).
- Saat dibuka, fokus ke field pertama (form) atau tombol Batal (konfirmasi hapus/reset). Saat ditutup, fokus kembali ke tombol pemicu.
- Backdrop `rgba(38,36,30,.5)`; bayangan `--shadow-lg`; radius `--radius-lg`.
- Mobile: lebar 100% (maks 560 px), tinggi maks 92 vh, bagian isi menggulir, footer aksi tetap terlihat.

### 6.13 Banner pemberitahuan (notice)
- Satu baris di atas konten utama, ikon + teks + tombol "Tutup".
- Varian: **peringatan** (`--amber-100`/`--amber-700`) dan **error** (`--red-100`/`--red-700`).
- Memakai `role="status"` (peringatan) atau `role="alert"` (error).

### 6.14 Empty state
- Wadah tengah dengan ikon SVG sederhana, judul (`h3`), teks bantu, dan tombol aksi bila relevan. Latar `--cream-100`, radius `--radius-lg`, padding `--space-8`.

### 6.15 Footer
- Teks kecil `--ink-700`: "Aplikasi demo. Data kamar disimpan di browser ini dan dapat hilang bila data browser dihapus." (mengomunikasikan R-02). Prioritas: sebaiknya ada.

---

## 7. State Antarmuka

### 7.1 Loading
SPEC tidak memakai backend dan data dibaca sinkron dari `localStorage`, sehingga loading hanya singkat.

| Situasi | Tampilan |
| --- | --- |
| Memuat awal sebelum render pertama | Area katalog berisi teks "Memuat kamar…" (`role="status"`) pada HTML awal; diganti saat render pertama selesai. Tidak memakai spinner panjang atau data dummy. |
| Gambar kartu sedang dimuat | Wadah gambar berlatar `--cream-100` dengan rasio 4:3 tetap (mencegah lompatan tata letak). |
| Skeleton (opsional) | Bila dipakai, 3 kartu kerangka `--cream-100`, animasi pudar halus; **dimatikan** pada `prefers-reduced-motion`. |

### 7.2 Empty

| Konteks | Pesan | Aksi |
| --- | --- | --- |
| Katalog, hasil pencarian/filter kosong (F-08, AC-9) | Judul: **"Tidak ada kamar yang cocok"**. Bantu: "Coba ubah kata kunci atau filter Anda." | Tombol sekunder **"Reset filter"** → mengosongkan pencarian, filter tipe/status ke "Semua", sorting ke default |
| Katalog, belum ada kamar sama sekali (semua dihapus) | Judul: **"Belum ada kamar"**. Bantu: "Pengelola belum menambahkan kamar." | Tidak ada tombol reset filter (tidak relevan); tampil tautan teks "Buka dashboard" |
| Dashboard, belum ada kamar | Judul: **"Belum ada kamar di dashboard"**. Bantu: "Tambahkan kamar pertama atau kembalikan data contoh." | Tombol primer "Tambah kamar" + tombol sekunder "Reset data demo" (bila F-18 ada) |

### 7.3 Error

| Situasi | Perilaku UI |
| --- | --- |
| **Validasi form gagal** (AC-15) | Data tidak disimpan, dialog tetap terbuka; pesan inline di bawah setiap field yang salah; fokus dipindah ke field salah pertama; tombol Simpan tetap aktif. |
| **Data localStorage rusak/tidak valid** (AC-21, N-06) | Aplikasi memuat 6 kamar contoh tanpa crash; banner peringatan: "Data tersimpan tidak dapat dibaca. Data contoh dimuat." (sebaiknya ada). |
| **Gagal menulis localStorage** (kuota/mode privat) | Data tetap berubah di memori untuk sesi ini; banner error: "Perubahan tidak dapat disimpan di browser ini." |
| **Gambar gagal dimuat / `imageUrl` kosong atau tidak valid** (AC-22, R-06) | Otomatis diganti `/images/placeholder.svg`; tidak ada ikon gambar rusak. |
| **Nomor WhatsApp placeholder tidak membuka chat** (R-03, R-04) | Tidak ada pesan khusus; URL tetap dibentuk benar. Keterbatasan dijelaskan di README. |

Pesan validasi (Bahasa Indonesia, spesifik, dan menjelaskan cara memperbaiki):

| Field | Kondisi | Pesan |
| --- | --- | --- |
| Nama | Kosong atau > 60 karakter setelah trim | "Nama wajib diisi, 1–60 karakter." |
| Tipe | Bukan Standard/Deluxe/Family | "Pilih tipe kamar yang tersedia." |
| Harga | Kosong, negatif, atau bukan bilangan bulat | "Harga harus bilangan bulat 0 atau lebih." |
| Kapasitas | Bukan bilangan bulat 1–10 | "Kapasitas harus bilangan bulat 1–10." |
| Deskripsi | > 300 karakter | "Deskripsi maksimal 300 karakter." |
| URL gambar | Terisi tetapi bukan `/images/...` atau `http(s)://...` | "Gunakan path /images/... atau URL http(s), atau kosongkan." |

### 7.3.1 Perilaku field
- Validasi dijalankan **saat Simpan ditekan**; error pada sebuah field hilang saat pengguna mengubah field tersebut.
- Penghitung deskripsi "N / 300" diperbarui saat mengetik.

### 7.4 Disabled

| Elemen | Kondisi disabled | Tampilan |
| --- | --- | --- |
| Tombol booking | Kamar `tersedia: false` | Tombol `disabled` "Tidak tersedia" (latar `--cream-200`, teks `--ink-500`) + badge status "– Tidak tersedia" |
| Tombol "Reset filter" | Tidak ditampilkan saat ada hasil (hanya muncul pada empty state) | — |
| Tombol Simpan (opsional) | Tidak dinonaktifkan; validasi ditampilkan sebagai pesan, bukan dengan menonaktifkan tombol | — |
| Field `id` | Tidak ditampilkan; tidak dapat diedit | — |

### 7.5 Interaksi dan umpan balik
- Pindah tampilan tidak memuat ulang halaman.
- Setelah tambah/ubah/hapus: dialog menutup, daftar dan ringkasan diperbarui, dan sebuah pesan status singkat (`role="status"`, mis. "Kamar disimpan.") diumumkan; teks pesan tidak bergantung pada warna.
- Tambah/ubah/hapus tidak memerlukan indikator loading karena sinkron.

---

## 8. Microcopy (Bahasa Indonesia)

| Elemen | Teks |
| --- | --- |
| Brand | StayEase |
| Navigasi | Katalog · Dashboard |
| Hero (h1) | Menginap nyaman, pesan lewat WhatsApp |
| Hero (isi) | Pilih kamar homestay yang cocok, lalu hubungi pengelola langsung. |
| Hero (tombol) | Lihat kamar |
| Judul katalog | Katalog kamar |
| Label pencarian | Cari kamar · placeholder "Nama, tipe, atau deskripsi" |
| Label filter | Tipe · Ketersediaan · Urutkan |
| Penghitung | Menampilkan {n} dari {total} kamar |
| Kapasitas | {n} tamu |
| Harga | Rp{angka} / malam |
| Status | ✓ Tersedia · – Tidak tersedia |
| Booking | Booking via WhatsApp · Tidak tersedia |
| Dashboard | Dashboard pengelola · Kelola data kamar homestay. |
| Ringkasan | Total kamar · Kamar tersedia |
| Aksi dashboard | Tambah kamar · Ubah · Hapus · Ubah status · Reset data demo |
| Judul dialog | Tambah kamar · Ubah kamar · Hapus kamar? · Reset data demo? |
| Konfirmasi hapus | "{nama}" akan dihapus dari katalog dan dashboard. Tindakan ini tidak dapat dibatalkan. |
| Konfirmasi reset | Semua perubahan akan diganti dengan 6 kamar contoh. Lanjutkan? |
| Tombol dialog | Batal · Simpan · Hapus · Reset |
| Pesan sukses | Kamar disimpan. · Kamar dihapus. · Data demo dikembalikan. |
| Footer | Aplikasi demo. Data kamar disimpan di browser ini dan dapat hilang bila data browser dihapus. |

---

## 9. Aksesibilitas (acuan WCAG 2.1 AA, selaras N-03)

1. **Struktur:** satu `h1` (hero) per tampilan Katalog; Dashboard memakai `h1` untuk judul tampilan; hierarki heading tidak melompat; landmark `header`, `nav`, `main`, `footer`.
2. **Skip link** "Lewati ke konten utama" muncul saat difokus.
3. **Keyboard:** semua kontrol dapat dijangkau dengan `Tab`; urutan fokus mengikuti urutan visual; `Enter`/`Space` mengaktifkan tombol; `Esc` menutup dialog.
4. **Fokus terlihat:** cincin 3 px `--focus` pada semua elemen interaktif; tidak ada `outline: none` tanpa pengganti.
5. **Label:** setiap input/select/textarea punya `<label>` terlihat dan terhubung.
6. **Gambar:** setiap `<img>` punya `alt` bermakna (nama kamar); dekorasi memakai `alt=""` atau `aria-hidden`.
7. **Target sentuh:** minimal 44 × 44 px untuk tombol, tautan nav, dan kontrol formulir.
8. **Warna:** kontras mengikuti Bagian 3.1; status dan error selalu disertai teks/ikon.
9. **Pengumuman dinamis:** penghitung hasil, ringkasan dashboard, dan pesan sukses memakai `aria-live="polite"`; error penyimpanan memakai `role="alert"`.
10. **Dialog:** `aria-labelledby`, fokus terkunci, fokus dikembalikan ke pemicu.
11. **Tautan eksternal:** tautan WhatsApp diberi teks tersembunyi atau `aria-label` "Booking {nama kamar} via WhatsApp (membuka tab baru)".
12. **Gerak:** hormati `prefers-reduced-motion`.
13. **Zoom:** konten tetap terbaca pada zoom 200% tanpa scroll horizontal di luar tabel.

---

## 10. Keterlacakan terhadap SPEC

| Elemen UI | Fitur SPEC | Acceptance criteria |
| --- | --- | --- |
| Grid 6 kartu dari data contoh | F-01, F-03 | AC-1, 2, 3 |
| Gambar + placeholder lokal | F-02 | AC-22 |
| Kolom pencarian | F-04 | AC-4, 5 |
| Filter tipe + ketersediaan | F-05 | AC-6, 7 |
| Dropdown urutkan | F-06 | AC-8 |
| Tombol/tautan booking WhatsApp | F-07 | AC-10, 11, 12 |
| Empty state + Reset filter | F-08 | AC-9 |
| Kartu ringkasan dashboard | F-09 | AC-13 |
| Dialog form tambah | F-10 | AC-14, 15 |
| Dialog form ubah | F-11 | AC-16 |
| Dialog konfirmasi hapus | F-12 | AC-17 |
| Daftar kamar dashboard | F-13 | AC-13–17 |
| Navbar dua tampilan | F-14 | — |
| Tombol "Ubah status" | F-15 (S) | — |
| Persistensi (tanpa UI khusus) | F-16, F-17 | AC-2, 18, 21, 23 |
| Tombol Reset data demo | F-18 (S) | AC-19 |
| Render teks aman (tanpa HTML mentah) | N-05 | AC-20 |
| Layout 360–1440 px | N-02 | — |

---

## 11. Di Luar Lingkup UI

Tidak dirancang dan tidak boleh ditambahkan (SPEC Bagian 7): halaman login/registrasi, pemilih tanggal check-in/out, keranjang atau riwayat pesanan, pembayaran, rating/ulasan/favorit, peta/lokasi, upload gambar dari perangkat, pemilih bahasa/mata uang, notifikasi, mode gelap, dan animasi berat.
