/**
 * Expense & Budget Visualizer — script.js
 * Vanilla JavaScript only. No frameworks.
 *
 * New in this version:
 *  ① Keyword-based automatic icon matching for all categories
 *  ② Period filter: month, year, specific date — with Reset
 *  ③ Filter + sort work together on the visible list
 *  ④ Total & chart always reflect ALL transactions (never filtered)
 */

'use strict';

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */
const STORAGE_KEY_TRANSACTIONS = 'ebv_transactions';
const STORAGE_KEY_CATEGORIES   = 'ebv_custom_categories';
const STORAGE_KEY_THEME        = 'ebv_theme';
const STORAGE_KEY_SORT         = 'ebv_sort';

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

/* ----------------------------------------------------------
   ① KEYWORD → ICON MAPPING
   Each entry: { keywords: [...lowercase strings], icon: '...' }
   The first entry whose keywords contain a substring of the
   lowercased category name wins.
   ---------------------------------------------------------- */
const ICON_RULES = [
  { keywords: ['food','makan','lunch','dinner','breakfast','snack','coffee','kopi','nasi','mie','bakso','soto','warung','restoran','restaurant','cafe','kantin','jajan','kuliner','pizza','burger','sushi'], icon: '🍔' },
  { keywords: ['transport','bus','motor','bensin','bbm','ojek','grab','gojek','taxi','taksi','parkir','tol','kereta','mrt','lrt','angkot','krl','commuter','tiket'], icon: '🚗' },
  { keywords: ['fun','hiburan','entertainment','game','gaming','nonton','bioskop','cinema','konser','concert','karaoke','jalan','piknik','rekreasi','taman'], icon: '🎮' },
  { keywords: ['shopping','belanja','beli','toko','mall','online shop','shopee','tokopedia','lazada','fashion','baju','sepatu','tas','clothes'], icon: '🛍️' },
  { keywords: ['health','kesehatan','obat','dokter','klinik','rumah sakit','apotek','vitamin','suplemen','medis','dental','gigi','mata'], icon: '💊' },
  { keywords: ['education','belajar','kursus','les','buku','sekolah','kampus','kuliah','training','workshop','seminar','sertifikat','pendidikan'], icon: '📚' },
  { keywords: ['bills','tagihan','listrik','air','pam','pln','internet','wifi','pulsa','data','langganan','subscribe','iuran','cicilan','kredit'], icon: '🧾' },
  { keywords: ['travel','liburan','wisata','hotel','penginapan','tiket','pesawat','bandara','airport','tour','trip','jalan-jalan','backpacker','villa'], icon: '✈️' },
  { keywords: ['beauty','skincare','kecantikan','makeup','kosmetik','salon','spa','perawatan','facial','hair','rambut','parfum'], icon: '💄' },
  { keywords: ['gym','olahraga','fitness','sport','renang','sepeda','lari','badminton','futsal','basket'], icon: '💪' },
  { keywords: ['pet','hewan','kucing','anjing','cat','dog','vet','dokter hewan','pakan'], icon: '🐾' },
  { keywords: ['charity','donasi','sedekah','infaq','zakat','sosial','sumbangan'], icon: '🤝' },
];

const DEFAULT_ICON = '🏷️';

/**
 * Return the best-matching emoji for a category name.
 * Case-insensitive substring keyword matching.
 * @param {string} category
 * @returns {string}
 */
function categoryIcon(category) {
  if (!category) return DEFAULT_ICON;
  const lower = category.toLowerCase();
  for (const rule of ICON_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.icon;
    }
  }
  return DEFAULT_ICON;
}

/* ----------------------------------------------------------
   COLOUR PALETTE — harmonises with sage-green design
   ---------------------------------------------------------- */
const PALETTE = [
  '#7C9473', // sage green  (Food)
  '#D96868', // coral       (Transport)
  '#D4A45C', // warm amber  (Fun)
  '#6BA3A3', // dusty teal
  '#B87CC8', // soft purple
  '#7CA3C8', // muted sky
  '#C8907C', // terracotta
  '#8DC87C', // lime green
  '#C8C07C', // warm olive
  '#A07CC8', // lavender
  '#C87C9A', // rose
  '#7CA3B8', // slate blue
];

/* ----------------------------------------------------------
   APPLICATION STATE
   ---------------------------------------------------------- */
/** @type {Transaction[]} */
let transactions = [];

/** @type {string[]} */
let customCategories = [];

/** @type {Chart|null} */
let chartInstance = null;

/** @type {string} */
let currentSort = 'date-desc';

/**
 * Active filter state.
 * month: '' | '0'–'11'   (string from select value)
 * year:  '' | '2024' etc (string from select value)
 * date:  '' | 'YYYY-MM-DD'
 */
const filter = { month: '', year: '', date: '' };

/* ============================================================
   TYPES (JSDoc)
   ============================================================ */
/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} name
 * @property {number} amount
 * @property {string} category
 * @property {number} timestamp  — Unix ms
 */

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const form               = document.getElementById('expenseForm');
const itemNameInput      = document.getElementById('itemName');
const amountInput        = document.getElementById('amount');
const categorySelect     = document.getElementById('category');
const totalAmountEl      = document.getElementById('totalAmount');
const transactionCountEl = document.getElementById('transactionCount');
const txCountBadgeEl     = document.getElementById('txCountBadge');
const transactionList    = document.getElementById('transactionList');
const emptyState         = document.getElementById('emptyState');
const sortSelect         = document.getElementById('sortSelect');
const themeToggle        = document.getElementById('themeToggle');
const themeIcon          = document.getElementById('themeIcon');
const toast              = document.getElementById('toast');
const newCategoryInput   = document.getElementById('newCategoryInput');
const addCategoryBtn     = document.getElementById('addCategoryBtn');
const customCategoryList = document.getElementById('customCategoryList');
const chartCanvas        = document.getElementById('expenseChart');
const chartWrapper       = document.getElementById('chartWrapper');
const chartEmpty         = document.getElementById('chartEmpty');
const chartLegendCustom  = document.getElementById('chartLegendCustom');
const footerYear         = document.getElementById('footerYear');
const navbar             = document.getElementById('navbar');
const hamburger          = document.getElementById('hamburger');
const mobileMenu         = document.getElementById('mobileMenu');

// Filter controls
const filterMonthEl  = document.getElementById('filterMonth');
const filterYearEl   = document.getElementById('filterYear');
const filterDateEl   = document.getElementById('filterDate');
const resetFilterBtn = document.getElementById('resetFilter');

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatRupiah(amount) {
  return 'Rp\u00A0' + amount.toLocaleString('id-ID');
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) + '\u00A0·\u00A0' + d.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  });
}

function getAllCategories() {
  const all = [...DEFAULT_CATEGORIES];
  customCategories.forEach(c => {
    if (!all.includes(c)) all.push(c);
  });
  return all;
}

function categoryColor(category) {
  const all = getAllCategories();
  const idx = all.indexOf(category);
  return PALETTE[idx >= 0 ? idx % PALETTE.length : PALETTE.length - 1];
}

/* ============================================================
   LOCAL STORAGE
   ============================================================ */
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    transactions = raw ? JSON.parse(raw) : [];
  } catch {
    transactions = [];
  }
}

function saveCustomCategories() {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));
}

function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    customCategories = raw ? JSON.parse(raw) : [];
  } catch {
    customCategories = [];
  }
}

function saveTheme(theme) { localStorage.setItem(STORAGE_KEY_THEME, theme); }
function loadTheme()       { return localStorage.getItem(STORAGE_KEY_THEME) || 'light'; }
function saveSort(value)   { localStorage.setItem(STORAGE_KEY_SORT, value); }
function loadSort()        { return localStorage.getItem(STORAGE_KEY_SORT) || 'date-desc'; }

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer = null;

function showToast(message, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ============================================================
   NAVBAR — scroll shadow + active link + hamburger
   ============================================================ */
function initNavbar() {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  const sections    = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  function setActiveLink(id) {
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
  }

  if ('IntersectionObserver' in window) {
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '68'
    );
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, { rootMargin: `-${navH}px 0px -55% 0px`, threshold: 0 });

    sections.forEach(sec => observer.observe(sec));
  }
}

/* ============================================================
   ② FILTER STATE & HELPERS
   ============================================================ */

/** True if any filter is active */
function hasActiveFilter() {
  return filter.month !== '' || filter.year !== '' || filter.date !== '';
}

/**
 * Convert timestamp to local date components without timezone shift.
 * Using local year/month/day avoids off-by-one day on UTC boundaries.
 */
function localDateParts(timestamp) {
  const d = new Date(timestamp);
  return {
    year:  d.getFullYear(),
    month: d.getMonth(),       // 0-based
    day:   d.getDate(),
    // ISO-like local date string for comparison with date picker value
    dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
  };
}

/**
 * Apply current filter state to an array of transactions.
 * Returns a new array; does NOT mutate the input.
 * @param {Transaction[]} txs
 * @returns {Transaction[]}
 */
function applyFilter(txs) {
  if (!hasActiveFilter()) return txs;

  return txs.filter(tx => {
    const { year, month, dateStr } = localDateParts(tx.timestamp);

    // Specific date filter — takes full precedence over month/year
    if (filter.date !== '') {
      return dateStr === filter.date;
    }

    // Month filter
    if (filter.month !== '' && month !== Number(filter.month)) return false;

    // Year filter
    if (filter.year !== '' && year !== Number(filter.year)) return false;

    return true;
  });
}

/** Populate the year dropdown dynamically from stored transactions. */
function renderYearOptions() {
  const currentVal = filterYearEl.value;

  // Collect unique years from all transactions
  const years = [...new Set(
    transactions.map(tx => new Date(tx.timestamp).getFullYear())
  )].sort((a, b) => b - a); // descending

  // Keep the "All Years" option, rebuild the rest
  filterYearEl.innerHTML = '<option value="">All Years</option>';
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = String(y);
    opt.textContent = String(y);
    if (String(y) === currentVal) opt.selected = true;
    filterYearEl.appendChild(opt);
  });
}

/** Reflect current filter state onto the DOM controls. */
function syncFilterUI() {
  const active = hasActiveFilter();

  // Highlight active filter controls
  filterMonthEl.classList.toggle('filter-active', filter.month !== '');
  filterYearEl.classList.toggle('filter-active',  filter.year  !== '');
  filterDateEl.classList.toggle('filter-active',  filter.date  !== '');

  // Reset button indicator
  resetFilterBtn.classList.toggle('has-active-filter', active);

  // Count badge styling
  if (txCountBadgeEl) {
    txCountBadgeEl.classList.toggle('filtered', active);
  }
}

function resetFilter() {
  filter.month = '';
  filter.year  = '';
  filter.date  = '';
  filterMonthEl.value = '';
  filterYearEl.value  = '';
  filterDateEl.value  = '';
  syncFilterUI();
  renderTransactions();
}

/* ============================================================
   VALIDATION
   ============================================================ */
function clearErrors() {
  ['itemName', 'amount', 'category'].forEach(id => {
    const errorEl = document.getElementById(`${id}Error`);
    const inputEl = document.getElementById(id);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('is-invalid');
  });
}

function validateForm() {
  clearErrors();
  let valid = true;
  const name      = itemNameInput.value.trim();
  const amountRaw = amountInput.value.trim();
  const category  = categorySelect.value;

  if (!name) {
    setError('itemName', 'Item name is required.');
    valid = false;
  } else if (name.length < 2) {
    setError('itemName', 'Name must be at least 2 characters.');
    valid = false;
  }

  if (!amountRaw) {
    setError('amount', 'Amount is required.');
    valid = false;
  } else if (isNaN(Number(amountRaw)) || Number(amountRaw) <= 0) {
    setError('amount', 'Enter a valid positive amount.');
    valid = false;
  } else if (!Number.isInteger(Number(amountRaw))) {
    setError('amount', 'Amount must be a whole number.');
    valid = false;
  }

  if (!category) {
    setError('category', 'Please select a category.');
    valid = false;
  }

  return { valid, name, amount: Number(amountRaw), category };
}

function setError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}Error`);
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.classList.add('is-invalid');
}

/* ============================================================
   TRANSACTIONS — CRUD
   ============================================================ */
function addTransaction(name, amount, category) {
  const tx = { id: generateId(), name, amount, category, timestamp: Date.now() };
  transactions.unshift(tx);
  saveTransactions();
  renderAll();
  showToast(`"${name}" added! ✓`);
}

function deleteTransaction(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.classList.add('removing');
    setTimeout(() => {
      transactions = transactions.filter(t => t.id !== id);
      saveTransactions();
      renderAll();
      showToast('Transaction deleted.', 'error');
    }, 220);
  } else {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderAll();
  }
}

/* ============================================================
   SORTING
   ============================================================ */
function sortTransactions(txs) {
  const copy = [...txs];
  switch (currentSort) {
    case 'date-desc':     return copy.sort((a, b) => b.timestamp - a.timestamp);
    case 'date-asc':      return copy.sort((a, b) => a.timestamp - b.timestamp);
    case 'amount-desc':   return copy.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':    return copy.sort((a, b) => a.amount - b.amount);
    case 'category-asc':  return copy.sort((a, b) => a.category.localeCompare(b.category));
    case 'category-desc': return copy.sort((a, b) => b.category.localeCompare(a.category));
    default:              return copy;
  }
}

/* ============================================================
   ④ RENDER — SUMMARY (always uses ALL transactions)
   ============================================================ */
function renderSummary() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  totalAmountEl.textContent = formatRupiah(total);
  const count = transactions.length;
  transactionCountEl.textContent = `${count} transaction${count !== 1 ? 's' : ''} recorded`;
}

/* ============================================================
   ④ RENDER — CHART (always uses ALL transactions)
   ============================================================ */
function renderChart() {
  if (transactions.length === 0) {
    chartWrapper.classList.add('hidden');
    chartEmpty.classList.add('visible');
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (chartLegendCustom) chartLegendCustom.innerHTML = '';
    return;
  }

  chartWrapper.classList.remove('hidden');
  chartEmpty.classList.remove('visible');

  // Aggregate ALL transactions by category
  const catMap = {};
  transactions.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });

  const labels    = Object.keys(catMap);
  const data      = Object.values(catMap);
  const grandTotal = data.reduce((s, v) => s + v, 0);
  const colors    = labels.map(l => categoryColor(l));
  const isDark    = document.documentElement.getAttribute('data-theme') === 'dark';
  const borderClr = isDark ? '#252528' : '#FFFFFF';

  // Custom legend
  if (chartLegendCustom) {
    chartLegendCustom.innerHTML = '';
    labels.forEach((label, i) => {
      const pct  = ((data[i] / grandTotal) * 100).toFixed(1);
      const item = document.createElement('div');
      item.className = 'legend-item';

      const dot = document.createElement('span');
      dot.className = 'legend-dot';
      dot.style.background = colors[i];

      const icon = document.createElement('span');
      icon.className = 'legend-icon';
      icon.textContent = categoryIcon(label);
      icon.setAttribute('aria-hidden', 'true');

      const name = document.createElement('span');
      name.className = 'legend-name';
      name.textContent = label;

      const pctEl = document.createElement('span');
      pctEl.className = 'legend-pct';
      pctEl.textContent = `${pct}%`;

      item.appendChild(dot);
      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(pctEl);
      chartLegendCustom.appendChild(item);
    });
  }

  if (chartInstance) {
    chartInstance.data.labels                        = labels;
    chartInstance.data.datasets[0].data              = data;
    chartInstance.data.datasets[0].backgroundColor   = colors;
    chartInstance.data.datasets[0].borderColor       = borderClr;
    chartInstance.update('active');
  } else {
    chartInstance = new Chart(chartCanvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor:      borderClr,
          borderWidth:      3,
          hoverOffset:      10,
          hoverBorderWidth: 3,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        devicePixelRatio:    window.devicePixelRatio || 2,
        animation: { animateRotate: true, duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: {
            padding:      10,
            cornerRadius: 10,
            callbacks: {
              label(ctx) {
                const val = ctx.parsed;
                const pct = ((val / grandTotal) * 100).toFixed(1);
                return `  ${categoryIcon(ctx.label)} ${formatRupiah(val)}  (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}

/* ============================================================
   RENDER — TRANSACTION LIST (filtered + sorted)
   ============================================================ */
function renderTransactions() {
  transactionList.innerHTML = '';
  syncFilterUI();

  // 1. Apply filter, then sort
  const filtered = applyFilter(transactions);
  const visible  = sortTransactions(filtered);

  // 2. Update count badge
  const isFiltered = hasActiveFilter();
  const totalCount = transactions.length;

  if (txCountBadgeEl) {
    if (isFiltered) {
      txCountBadgeEl.textContent = `${visible.length} of ${totalCount} item${totalCount !== 1 ? 's' : ''}`;
    } else {
      txCountBadgeEl.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
    }
  }

  // 3. Empty state — differentiate "no data" vs "no filter results"
  if (visible.length === 0) {
    emptyState.classList.add('visible');

    const emojiEl = emptyState.querySelector('.empty-emoji');
    const titleEl = emptyState.querySelector('.empty-title');
    const subEl   = emptyState.querySelector('.empty-sub');
    const ctaEl   = emptyState.querySelector('.btn-outline-primary');

    if (transactions.length === 0) {
      // No data at all
      if (emojiEl) emojiEl.textContent = '🛒';
      if (titleEl) titleEl.textContent = 'Nothing here yet';
      if (subEl)   subEl.textContent   = 'Your transactions will show up here once you add them.';
      if (ctaEl)   ctaEl.style.display = '';
    } else {
      // Data exists but filter returns nothing
      if (emojiEl) emojiEl.textContent = '🔍';
      if (titleEl) titleEl.textContent = 'No results for this filter';
      if (subEl)   subEl.textContent   = 'Try a different period or reset the filter.';
      if (ctaEl)   ctaEl.style.display = 'none';
    }
    return;
  }

  emptyState.classList.remove('visible');

  // 4. Render each visible transaction
  visible.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.setAttribute('data-id', tx.id);
    li.setAttribute('role', 'listitem');

    // Category icon chip
    const catIcon = document.createElement('div');
    catIcon.className = 'tx-cat-icon';
    catIcon.style.background = categoryColor(tx.category) + '22';
    catIcon.style.border     = `1.5px solid ${categoryColor(tx.category)}44`;
    catIcon.textContent      = categoryIcon(tx.category);
    catIcon.setAttribute('aria-hidden', 'true');

    // Info block
    const info = document.createElement('div');
    info.className = 'transaction-info';

    const nameEl = document.createElement('p');
    nameEl.className   = 'transaction-name';
    nameEl.textContent = tx.name;
    nameEl.title       = tx.name;

    const meta = document.createElement('p');
    meta.className = 'transaction-meta';

    const badge = document.createElement('span');
    badge.className   = 'category-badge';
    badge.textContent = tx.category;

    const dateSpan = document.createElement('span');
    dateSpan.className   = 'tx-date';
    dateSpan.textContent = formatDate(tx.timestamp);

    meta.appendChild(badge);
    meta.appendChild(dateSpan);
    info.appendChild(nameEl);
    info.appendChild(meta);

    // Amount
    const amount = document.createElement('span');
    amount.className   = 'transaction-amount';
    amount.textContent = formatRupiah(tx.amount);
    amount.setAttribute('aria-label', `Amount: ${formatRupiah(tx.amount)}`);

    // Delete
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger-ghost';
    delBtn.innerHTML  = '&#x2715;';
    delBtn.setAttribute('aria-label', `Delete ${tx.name}`);
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', () => deleteTransaction(tx.id));

    li.appendChild(catIcon);
    li.appendChild(info);
    li.appendChild(amount);
    li.appendChild(delBtn);

    transactionList.appendChild(li);
  });
}

/* ============================================================
   RENDER — CATEGORY SELECT (form dropdown)
   ============================================================ */
function renderCategorySelect() {
  const current = categorySelect.value;
  categorySelect.innerHTML = '<option value="">— Select category —</option>';
  getAllCategories().forEach(cat => {
    const opt = document.createElement('option');
    opt.value       = cat;
    opt.textContent = `${categoryIcon(cat)} ${cat}`;
    if (cat === current) opt.selected = true;
    categorySelect.appendChild(opt);
  });
}

/* ============================================================
   RENDER — CUSTOM CATEGORY TAGS
   ============================================================ */
function renderCustomCategoryTags() {
  customCategoryList.innerHTML = '';
  if (customCategories.length === 0) return;

  customCategories.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'tag';

    const iconEl = document.createElement('span');
    iconEl.textContent = categoryIcon(cat);
    iconEl.setAttribute('aria-hidden', 'true');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = cat;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'tag-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.setAttribute('aria-label', `Remove ${cat}`);
    removeBtn.title = `Remove ${cat}`;
    removeBtn.addEventListener('click', () => removeCustomCategory(cat));

    li.appendChild(iconEl);
    li.appendChild(nameSpan);
    li.appendChild(removeBtn);
    customCategoryList.appendChild(li);
  });
}

function addCustomCategory() {
  const errorEl = document.getElementById('categoryInputError');
  const value   = newCategoryInput.value.trim();
  errorEl.textContent = '';

  if (!value) { errorEl.textContent = 'Please enter a category name.'; return; }
  if (value.length < 2) { errorEl.textContent = 'Name must be at least 2 characters.'; return; }

  const all = getAllCategories().map(c => c.toLowerCase());
  if (all.includes(value.toLowerCase())) {
    errorEl.textContent = `"${value}" already exists.`;
    return;
  }

  customCategories.push(value);
  saveCustomCategories();
  renderCustomCategoryTags();
  renderCategorySelect();
  newCategoryInput.value = '';
  newCategoryInput.focus();
  showToast(`Category "${value}" added! Icon: ${categoryIcon(value)}`);
}

function removeCustomCategory(cat) {
  customCategories = customCategories.filter(c => c !== cat);
  saveCustomCategories();
  renderCustomCategoryTags();
  renderCategorySelect();
  // Existing transactions that used this category are NOT changed —
  // their category name + data remain intact in localStorage.
  showToast(`Category "${cat}" removed.`, 'error');
}

/* ============================================================
   MASTER RENDER
   Note: renderSummary + renderChart ALWAYS use all transactions.
         renderTransactions applies the active filter.
   ============================================================ */
function renderAll() {
  renderSummary();          // all transactions
  renderChart();            // all transactions
  renderYearOptions();      // rebuild year dropdown from all transactions
  renderTransactions();     // filtered + sorted
  renderCategorySelect();
  renderCustomCategoryTags();
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

// Add expense form
form.addEventListener('submit', e => {
  e.preventDefault();
  const { valid, name, amount, category } = validateForm();
  if (!valid) return;

  addTransaction(name, amount, category);
  itemNameInput.value  = '';
  amountInput.value    = '';
  categorySelect.value = '';
  clearErrors();
  itemNameInput.focus();
});

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Sort
sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  saveSort(currentSort);
  renderTransactions();
});

// Filter: month
filterMonthEl.addEventListener('change', () => {
  filter.month = filterMonthEl.value;
  // When specific date is set, clear it because month overrides
  if (filter.date !== '') {
    filter.date = '';
    filterDateEl.value = '';
  }
  renderTransactions();
});

// Filter: year
filterYearEl.addEventListener('change', () => {
  filter.year = filterYearEl.value;
  if (filter.date !== '') {
    filter.date = '';
    filterDateEl.value = '';
  }
  renderTransactions();
});

// Filter: specific date
filterDateEl.addEventListener('change', () => {
  filter.date = filterDateEl.value;
  if (filter.date !== '') {
    // Specific date takes full precedence — clear month/year selection
    filter.month = '';
    filter.year  = '';
    filterMonthEl.value = '';
    filterYearEl.value  = '';
  }
  renderTransactions();
});

// Reset filter
resetFilterBtn.addEventListener('click', resetFilter);

// Add custom category
addCategoryBtn.addEventListener('click', addCustomCategory);
newCategoryInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); }
});

// Live validation — clear error on input
[itemNameInput, amountInput, categorySelect].forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('is-invalid');
    const errorEl = document.getElementById(`${el.id}Error`);
    if (errorEl) errorEl.textContent = '';
  });
});

// Re-render chart on theme change (border colours)
const themeObserver = new MutationObserver(() => {
  if (chartInstance) renderChart();
});
themeObserver.observe(document.documentElement, {
  attributes:      true,
  attributeFilter: ['data-theme'],
});

/* ============================================================
   INIT
   ============================================================ */
function init() {
  loadTransactions();
  loadCustomCategories();

  applyTheme(loadTheme());

  currentSort      = loadSort();
  sortSelect.value = currentSort;

  footerYear.textContent = new Date().getFullYear();

  initNavbar();
  renderAll();
}

init();
