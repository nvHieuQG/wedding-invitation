/* ===========================================================
   admin.js – Wedding RSVP Admin Panel Logic
   Văn Cường & Hải Lý
=========================================================== */

/* ── 🔐 Bảo mật: Yêu cầu mật khẩu ─────────────────────── */
// ── Tất cả logic đặt trong window.onload để đảm bảo DOM sẵn sàng ──
window.addEventListener('load', function() {

  /* ── 🔐 Bảo mật: Yêu cầu mật khẩu ──────────────────────── */
  // ⚠️ ĐỔI MẬT KHẨU NÀY trước khi deploy!
  const ADMIN_PASSWORD = 'wedding2025';

  if (sessionStorage.getItem('admin_auth') !== '1') {
    const pw = prompt('🔐 Nhập mật khẩu để vào trang quản lý:');
    if (pw !== ADMIN_PASSWORD) {
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;
          justify-content:center;min-height:100vh;font-family:sans-serif;
          color:#3a2a1a;gap:16px;background:#fdf6ec;">
          <div style="font-size:4rem;">🔒</div>
          <h1 style="font-size:1.5rem;color:#9b0b22;">Truy cập bị từ chối</h1>
          <p style="color:#7a5c3a;">Sai mật khẩu. Bạn không có quyền truy cập trang này.</p>
          <a href="../index.html" style="color:#c8102e;font-weight:600;text-decoration:none;
            padding:12px 24px;border:2px solid #c8102e;border-radius:8px;margin-top:8px;">
            ← Về trang thiệp mời
          </a>
        </div>`;
      return; // Dừng toàn bộ logic, không khởi tạo gì thêm
    }
    sessionStorage.setItem('admin_auth', '1');
  }

  // ── Xác thực thành công → khởi tạo trang ──
  initAdmin();

});


/* ── Constants ───────────────────────────────────────────── */
const KEY = 'wedding_rsvp';

/* ── Data helpers ────────────────────────────────────────── */
function loadData()    { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
function saveData(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

/* ── Format thời gian ────────────────────────────────────── */
function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ── Escape HTML (chống XSS) ────────────────────────────── */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Snackbar thông báo ──────────────────────────────────── */
let _snackTimer = null;
function showSnack(msg, ms = 2800) {
  const el = document.getElementById('snack');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_snackTimer);
  _snackTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ── Cập nhật thống kê ───────────────────────────────────── */
function updateStats(data) {
  const yesArr = data.filter(r => r.attend === 'yes');
  const noArr  = data.filter(r => r.attend === 'no');
  const guests = data.reduce((s, r) => s + (r.attend === 'yes' ? (r.guests || 0) + 1 : 0), 0);
  document.getElementById('stat-total').textContent  = data.length;
  document.getElementById('stat-yes').textContent    = yesArr.length;
  document.getElementById('stat-no').textContent     = noArr.length;
  document.getElementById('stat-guests').textContent = guests;
}

/* ── Render bảng danh sách ───────────────────────────────── */
function render() {
  const search  = document.getElementById('search-input').value.toLowerCase();
  const filterA = document.getElementById('filter-attend').value;
  const sortBy  = document.getElementById('filter-sort').value;

  const allData = loadData();
  updateStats(allData);

  let data = [...allData];
  if (filterA) data = data.filter(r => r.attend === filterA);
  if (search)  data = data.filter(r =>
    (r.name    || '').toLowerCase().includes(search) ||
    (r.phone   || '').toLowerCase().includes(search) ||
    (r.message || '').toLowerCase().includes(search)
  );
  if (sortBy === 'newest') data.sort((a, b) => b.id - a.id);
  else if (sortBy === 'oldest') data.sort((a, b) => a.id - b.id);
  else if (sortBy === 'name')   data.sort((a, b) => (a.name||'').localeCompare(b.name||'', 'vi'));

  document.getElementById('result-count').textContent = `${data.length} kết quả`;
  const wrap = document.getElementById('table-body-wrap');

  if (data.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">💌</span>
        <div class="empty-title">Chưa có xác nhận nào</div>
        <div class="empty-sub">Khi khách gửi form, danh sách sẽ hiển thị tại đây.</div>
      </div>`;
    return;
  }

  const rows = data.map(r => {
    const bc = r.attend === 'yes' ? 'badge-yes' : r.attend === 'no' ? 'badge-no' : 'badge-pending';
    const bt = r.attend === 'yes' ? '✅ Tham dự' : r.attend === 'no' ? '❌ Không đến' : '⏳ Chưa chọn';
    const g  = r.attend === 'yes' ? `+${r.guests || 0} người` : '—';
    return `
      <tr>
        <td data-label="Họ và tên"     class="td-name">${esc(r.name   || '—')}</td>
        <td data-label="Điện thoại"    class="td-phone">${esc(r.phone || '—')}</td>
        <td data-label="Trạng thái"><span class="badge ${bc}">${bt}</span></td>
        <td data-label="Người đi cùng">${g}</td>
        <td data-label="Lời nhắn"      class="td-msg" title="${esc(r.message || '')}">${esc(r.message || '—')}</td>
        <td data-label="Thời gian"     class="td-time">${formatTime(r.time)}</td>
        <td><button class="btn-del" data-id="${r.id}" aria-label="Xóa xác nhận của ${esc(r.name || 'khách')}">🗑</button></td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Họ và tên</th><th>Điện thoại</th><th>Trạng thái</th>
          <th>Người đi cùng</th><th>Lời nhắn</th><th>Thời gian</th><th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  // Gắn sự kiện xóa qua event delegation (tránh inline onclick)
  wrap.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete(Number(btn.dataset.id)));
  });
}

/* ── Confirm Dialog ──────────────────────────────────────── */
let _confirmCb = null;

function openConfirm(icon, title, sub, cb) {
  document.getElementById('confirm-icon').textContent  = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-sub').textContent   = sub;
  _confirmCb = cb;
  document.getElementById('confirm-ok').onclick = () => { closeConfirm(); cb(); };
  document.getElementById('confirm-overlay').classList.add('show');
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.remove('show');
  _confirmCb = null;
}

function confirmDelete(id) {
  openConfirm('🗑️', 'Xóa xác nhận này?', 'Hành động này không thể hoàn tác.', () => {
    saveData(loadData().filter(r => r.id !== id));
    render();
    showSnack('✅ Đã xóa xác nhận');
  });
}

function confirmClearAll() {
  const n = loadData().length;
  if (!n) { showSnack('Danh sách đang trống!'); return; }
  openConfirm('⚠️', `Xóa tất cả ${n} xác nhận?`, 'Toàn bộ dữ liệu sẽ bị xóa vĩnh viễn.', () => {
    localStorage.removeItem(KEY);
    render();
    showSnack('🗑 Đã xóa toàn bộ danh sách');
  });
}

/* ── Xuất CSV ────────────────────────────────────────────── */
function exportCSV() {
  const data = loadData();
  if (!data.length) { showSnack('Không có dữ liệu để xuất!'); return; }
  const header = ['ID', 'Họ tên', 'Điện thoại', 'Tham dự', 'Người đi cùng', 'Lời nhắn', 'Thời gian'];
  const rows = data.map(r => [
    r.id,
    `"${(r.name    || '').replace(/"/g, '""')}"`,
    `"${(r.phone   || '').replace(/"/g, '""')}"`,
    r.attend === 'yes' ? 'Có' : r.attend === 'no' ? 'Không' : 'Chưa chọn',
    r.attend === 'yes' ? (r.guests || 0) : 0,
    `"${(r.message || '').replace(/"/g, '""')}"`,
    formatTime(r.time),
  ]);
  const csv  = '\uFEFF' + [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `rsvp_${new Date().toISOString().slice(0, 10)}.csv`
  });
  a.click();
  URL.revokeObjectURL(url);
  showSnack(`✅ Đã xuất ${data.length} bản ghi`);
}

/* ── Khởi tạo ────────────────────────────────────────────── */
function initAdmin() {
  // Controls
  document.getElementById('search-input').addEventListener('input', render);
  document.getElementById('filter-attend').addEventListener('change', render);
  document.getElementById('filter-sort').addEventListener('change', render);

  // Buttons
  document.getElementById('btn-export').addEventListener('click', exportCSV);
  document.getElementById('btn-clear').addEventListener('click', confirmClearAll);
  document.getElementById('btn-cancel').addEventListener('click', closeConfirm);

  // Đóng confirm khi click overlay
  document.getElementById('confirm-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirm-overlay')) closeConfirm();
  });

  // ✅ Thay setInterval bằng storage event để sync nhiều tab
  window.addEventListener('storage', e => {
    if (e.key === KEY) render();
  });

  render();
}
