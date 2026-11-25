# Project Steering — Expense & Budget Visualizer

## Deskripsi Project
Aplikasi web pencatat pengeluaran harian dengan tampilan Modern Gen Z Personal Finance Dashboard. Dibuat sebagai tugas submission **RevoU Coding Camp** oleh **Sephia Septiani**.

Aplikasi berjalan sepenuhnya di browser — tidak ada server, tidak ada build step, tidak ada dependensi yang perlu diinstal.

---

## Teknologi

| Teknologi | Versi / Sumber | Peran |
|---|---|---|
| HTML5 | — | Struktur halaman, semantik, aksesibilitas |
| CSS3 | — | Custom properties, Flexbox, Grid, animasi, responsive |
| Vanilla JavaScript | ES6+ | Seluruh logika aplikasi |
| Chart.js | 4.4.0 (CDN) | Pie chart distribusi pengeluaran per kategori |
| Plus Jakarta Sans | Google Fonts | Tipografi utama |

Tidak menggunakan React, Vue, Angular, atau framework JavaScript apapun.  
Tidak ada backend, tidak ada database eksternal — semua data disimpan di **Local Storage** browser.

---

## Struktur Folder

```
CodingCamp-231126-sephiaspp/
├── index.html          ← Entry point aplikasi, seluruh markup HTML
├── css/
│   └── style.css       ← Seluruh styling: design system, tema, komponen, responsive
├── js/
│   └── script.js       ← Seluruh logika: state, DOM, Local Storage, Chart.js
├── .kiro/
│   └── steering/
│       └── project.md  ← File ini: konteks project untuk Kiro IDE
├── .gitattributes
└── README.md           ← Dokumentasi project untuk GitHub
```

---

## Arsitektur Aplikasi

### State Management
State disimpan dalam variabel module-level di `script.js`:
- `transactions` — array objek transaksi (`id`, `name`, `amount`, `category`, `timestamp`)
- `customCategories` — array string nama kategori tambahan
- `chartInstance` — instance Chart.js yang aktif
- `currentSort` — nilai sort aktif
- `filter` — objek filter aktif (`month`, `year`, `date`)

### Alur Data
```
User input → validateForm() → addTransaction() → saveTransactions() → renderAll()
                                                                           ├── renderSummary()     (semua transaksi)
                                                                           ├── renderChart()       (semua transaksi)
                                                                           ├── renderYearOptions() (semua transaksi)
                                                                           └── renderTransactions() (filtered + sorted)
```

### Local Storage Keys
| Key | Isi |
|---|---|
| `ebv_transactions` | Array JSON seluruh transaksi |
| `ebv_custom_categories` | Array JSON kategori custom |
| `ebv_theme` | `"light"` atau `"dark"` |
| `ebv_sort` | Nilai sort aktif, misal `"date-desc"` |

---

## Fitur Aplikasi

### Fitur Wajib (MVP)
- Form input: Item Name, Amount (Rp), Category
- Kategori default: Food 🍔, Transport 🚗, Fun 🎉
- Validasi semua input dengan pesan error per field
- Tambah transaksi ke daftar (dengan animasi slide-in)
- Tampilkan nama, nominal, kategori, dan tanggal/waktu
- Hapus transaksi (dengan animasi fade-out)
- Total pengeluaran otomatis di hero card
- Pie chart distribusi per kategori (Chart.js)
- Auto-update total dan chart setiap ada perubahan
- Persistensi data via Local Storage

### Fitur Tambahan
- **Custom Categories** — tambah/hapus kategori sendiri, tersimpan di Local Storage
- **Sort Transactions** — 6 opsi: terbaru, terlama, nominal ↑↓, kategori A–Z/Z–A
- **Filter Transaksi** — filter per bulan, tahun, atau tanggal spesifik; dapat dikombinasikan
- **Dark/Light Mode** — toggle tema, preferensi tersimpan di Local Storage
- **Keyword Icon Matching** — ikon emoji otomatis berdasarkan nama kategori (12 rule set)

### Fitur UI/UX
- Navbar sticky dengan logo inline SVG, 5 menu navigasi, hamburger mobile
- IntersectionObserver untuk active state navbar saat scroll
- 5 section terpisah: Overview, Add Expense, Insights, Transactions, Categories
- Toast notification global (bottom-center, auto-dismiss 2.8 detik)
- Custom legend pada pie chart (ikon + persentase)
- Pie chart tajam di retina display (`devicePixelRatio`)
- Animasi `txSlideIn` / `txFadeOut` pada list transaksi
- Empty state berbeda: "belum ada data" vs "tidak ada hasil filter"
- Responsive mobile-first dengan hamburger menu

---

## Design System

### Palet Warna
| Token | Hex | Peran |
|---|---|---|
| Warm off-white | `#EBEAE6` | Background utama |
| Sage green | `#7C9473` | Primary color, logo, CTA button |
| Soft coral | `#D96868` | Accent, delete, toast error, logo leaf |
| Dark charcoal | `#1E1D1B` | Teks utama (light mode) |

### CSS Custom Properties
Seluruh token warna, ukuran, dan spacing didefinisikan sebagai CSS custom properties di `:root` pada `style.css`. Dark mode override dilakukan dengan `[data-theme="dark"]` pada `:root`.

---

## Batasan Pengembangan

1. **Tidak ada framework** — Tetap gunakan Vanilla JS. Tidak boleh menambah React, Vue, atau bundler.
2. **Tidak ada backend** — Semua data harus bisa tersimpan di Local Storage atau state in-memory. Tidak ada fetch ke API eksternal (selain CDN).
3. **Satu file per layer** — Satu `index.html`, satu `style.css`, satu `script.js`. Jangan memecah ke file tambahan kecuali ada instruksi eksplisit.
4. **CSS custom properties** — Jangan hardcode nilai warna atau spacing langsung; gunakan token yang sudah ada.
5. **Aksesibilitas dasar** — Pertahankan atribut `aria-label`, `role`, dan `aria-hidden` yang sudah ada. Jangan menghapus elemen semantik.
6. **Local Storage** — Selalu gunakan key yang sudah ada (`ebv_*`). Jangan menambah key baru tanpa alasan jelas.
7. **Chart.js** — Gunakan instance `chartInstance` yang ada; jangan membuat instance baru tanpa menghancurkan yang lama terlebih dahulu.
8. **Jangan ubah README.md** — File itu adalah dokumentasi submission; ubah hanya jika diminta secara eksplisit.

---

## Konteks Submission RevoU

Project ini adalah tugas akhir **RevoU Coding Camp** (Coding Camp 231126 — cohort Sephia). Kriteria penilaian meliputi kelengkapan fitur MVP, kualitas kode, dan penggunaan alat bantu pengembangan termasuk Kiro IDE.

File steering ini digunakan oleh Kiro IDE untuk memahami konteks project saat memberikan saran kode, review, atau bantuan pengembangan.
