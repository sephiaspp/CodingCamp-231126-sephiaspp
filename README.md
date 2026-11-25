# 💰 Expense & Budget Visualizer

Aplikasi web pencatat pengeluaran harian dengan tampilan **Modern Gen Z Personal Finance Dashboard**.  
Dibuat sebagai tugas **RevoU Coding Camp**.

---

## 🚀 Cara Menjalankan

Tidak memerlukan instalasi apapun. Cukup buka file `index.html` di browser:

```
Expense & Budget Visualizer_sephiaspp/
└── index.html   ← buka file ini
```

> Semua data disimpan di **Local Storage** browser — data tetap ada setelah halaman di-refresh.  
> Website juga siap di-deploy melalui **GitHub Pages**.

---

## 📁 Struktur Folder

```
Expense & Budget Visualizer_sephiaspp/
├── index.html          ← Struktur halaman (HTML semantik)
├── css/
│   └── style.css       ← Seluruh styling & tema (CSS custom properties)
├── js/
│   └── script.js       ← Seluruh logika aplikasi (Vanilla JavaScript)
├── .kiro/              ← Konfigurasi Kiro IDE
└── README.md           ← Dokumentasi ini
```

---

## 🎨 Design System

**Palet warna:**
| Token | Hex | Peran |
|---|---|---|
| Warm off-white | `#EBEAE6` | Background utama |
| Sage green | `#7C9473` | Primary color, logo, CTA |
| Soft coral | `#D96868` | Accent, delete, toast error |
| Dark charcoal | `#1E1D1B` | Teks utama |

**Typography:** Plus Jakarta Sans (Google Fonts)

---

## ✅ Fitur Aplikasi

### Fitur Wajib (MVP)
| Fitur | Status |
|-------|--------|
| Form input: Item Name, Amount, Category | ✅ |
| Kategori awal: Food 🍔, Transport 🚗, Fun 🎉 | ✅ |
| Validasi seluruh input | ✅ |
| Tambah transaksi ke daftar | ✅ |
| Tampilkan nama, nominal, kategori, tanggal | ✅ |
| Hapus transaksi | ✅ |
| Total pengeluaran otomatis | ✅ |
| Pie chart distribusi per kategori | ✅ |
| Auto-update total & chart | ✅ |
| Persistensi data via Local Storage | ✅ |

### Fitur Tambahan
| Fitur | Detail |
|-------|--------|
| **Custom Categories** | Tambah/hapus kategori sendiri. Tersimpan di Local Storage. |
| **Sort Transactions** | 6 opsi urutan: terbaru, terlama, nominal ↑↓, kategori A–Z/Z–A. |
| **Dark/Light Mode** | Toggle tema. Preferensi tersimpan di Local Storage. |

### Fitur Desain Baru
- Navbar sticky dengan logo inline SVG, 5 menu navigasi, hamburger mobile menu
- IntersectionObserver untuk active state navbar saat scroll
- 5 section terpisah: Overview, Add Expense, Insights, Transactions, Categories
- Hero stat card dengan animasi dekoratif
- Chart dengan custom legend (ikon kategori + persentase)
- Chart tajam di retina display (`devicePixelRatio`, `maintainAspectRatio: false`)
- Animasi `txSlideIn` / `txFadeOut` pada transaksi
- Toast notification fixed bottom-center
- Ikon kategori konsisten di seluruh aplikasi
- Kategori pills berwarna per tipe di section Categories
- Dark mode dengan palette charcoal yang harmonis

---

## 🛠️ Teknologi

- **HTML5** — Struktur semantik
- **CSS3** — Custom properties, Flexbox, Grid, animasi, responsive mobile-first
- **Vanilla JavaScript (ES6+)** — Logika aplikasi, DOM, Local Storage, IntersectionObserver
- **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** — Tipografi (Google Fonts)
- **[Chart.js 4.4](https://www.chartjs.org/)** — Pie chart (via CDN)

> Tidak menggunakan React, Vue, atau framework JavaScript.  
> Tidak memerlukan backend atau server.

---

## 👤 Pembuat

**Sephia Septiani** — RevoU Coding Camp
