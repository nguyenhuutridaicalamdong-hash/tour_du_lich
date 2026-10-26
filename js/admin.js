/* =========================================================
   GoTravel - Admin Portal Controller
   ========================================================= */

let adminOrderFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  GTStore.init();
  // Ensure user is recognized as admin
  const u = GTStore.getCurrentUser();
  if (!u || u.role !== 'admin') {
    alert('Trang Quản trị yêu cầu quyền Admin. Vui lòng đăng nhập bằng tài khoản Quản trị viên (admin@gotravel.vn / admin123).');
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('admin-user-name').textContent = u.name || 'Quản trị viên';

  loadDashboardStats();
  loadAdminTours();
  loadAdminOrders();
  loadAdminCustomers();
  loadAdminCoupons();
});

function switchAdminSection(secName, btn) {
  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titles = {
    dashboard: 'Tổng quan hệ thống (Dashboard)',
    tours: 'Quản lý danh sách Tour du lịch',
    orders: 'Quản lý Đơn hàng & Đặt chỗ',
    customers: 'Quản lý Khách hàng & Thành viên',
    coupons: 'Quản lý Chương trình Khuyến mãi'
  };
  document.getElementById('admin-section-title').textContent = titles[secName] || 'Admin';

  document.getElementById('sec-dashboard').classList.toggle('d-none', secName !== 'dashboard');
  document.getElementById('sec-tours').classList.toggle('d-none', secName !== 'tours');
  document.getElementById('sec-orders').classList.toggle('d-none', secName !== 'orders');
  document.getElementById('sec-customers').classList.toggle('d-none', secName !== 'customers');
  document.getElementById('sec-coupons').classList.toggle('d-none', secName !== 'coupons');

  // Close mobile sidebar if open
  document.getElementById('admin-sidebar').classList.remove('show');
}

function loadDashboardStats() {
  const orders = GTStore.getOrders();
  const tours = GTStore.getTours();
  const users = GTStore.getUsers();

  const totalRev = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
  document.getElementById('stat-revenue').textContent = GTApp.formatVND(totalRev);
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-customers').textContent = users.length;
  document.getElementById('stat-tours').textContent = tours.length;

  // Recent Orders list (top 4)
  const recent = orders.slice(0, 4);
  document.getElementById('recent-orders-list').innerHTML = recent.map(o => `
    <div class="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
      <div>
        <strong class="font-monospace text-primary small d-block">${o.code}</strong>
        <span class="small text-navy text-truncate d-block" style="max-width:180px;">${o.tourName}</span>
      </div>
      <div class="text-end">
        <strong class="text-orange small d-block">${GTApp.formatVND(o.total)}</strong>
        <span class="badge ${o.status === 'paid' ? 'bg-success' : (o.status === 'cancelled' ? 'bg-danger' : 'bg-warning')}">${o.status}</span>
      </div>
    </div>
  `).join('');
}

function loadAdminTours() {
  const tours = GTStore.getTours();
  const tbody = document.getElementById('admin-tours-tbody');
  tbody.innerHTML = tours.map(t => `
    <tr>
      <td><img src="${(t.images && t.images[0]) || FALLBACK_IMG}" style="width:48px;height:38px;object-fit:cover;border-radius:8px;"></td>
      <td><strong class="text-navy">${t.name}</strong><br><small class="text-muted">${t.days}N${t.nights}Đ • ${t.departFrom || 'Hà Nội'}</small></td>
      <td>${t.destination}</td>
      <td><strong class="text-orange">${GTApp.formatVND(t.price)}</strong></td>
      <td>${t.seats || 30}</td>
      <td><span class="badge bg-success-subtle text-success">Đang bán</span></td>
      <td class="text-end">
        <a href="tour-detail.html?id=${t.id}" target="_blank" class="btn btn-sm btn-outline-secondary me-1" title="Xem trên web"><i class="bi bi-eye"></i></a>
        <button class="btn btn-sm btn-outline-gt me-1" onclick="editTour(${t.id})" title="Sửa"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTour(${t.id})" title="Xóa"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openTourModal(tour = null) {
  document.getElementById('tour-crud-id').value = tour ? tour.id : '';
  document.getElementById('tourModalTitle').textContent = tour ? 'Chỉnh Sửa Tour Du Lịch' : 'Thêm Tour Du Lịch Mới';
  document.getElementById('t-name').value = tour ? tour.name : '';
  document.getElementById('t-badge').value = tour ? (tour.badge || 'Bán chạy') : 'Bán chạy';
  document.getElementById('t-destination').value = tour ? tour.destination : '';
  document.getElementById('t-region').value = tour ? (tour.region || 'Miền Bắc') : 'Miền Bắc';
  document.getElementById('t-type').value = tour ? (tour.type || 'Biển đảo') : 'Biển đảo';
  document.getElementById('t-days').value = tour ? tour.days : 3;
  document.getElementById('t-nights').value = tour ? tour.nights : 2;
  document.getElementById('t-depart').value = tour ? tour.departFrom : 'Hà Nội';
  document.getElementById('t-price').value = tour ? tour.price : '';
  document.getElementById('t-oldprice').value = tour ? (tour.oldPrice || '') : '';
  document.getElementById('t-img').value = (tour && tour.images) ? tour.images[0] : '';
  document.getElementById('t-overview').value = tour ? (tour.overview || '') : '';

  new bootstrap.Modal(document.getElementById('tourModal')).show();
}

function editTour(id) {
  const t = GTStore.getTourById(id);
  if (t) openTourModal(t);
}

function deleteTour(id) {
  if (confirm('Bạn có chắc chắn muốn xóa tour này khỏi hệ thống?')) {
    GTStore.deleteTour(id);
    loadAdminTours();
    loadDashboardStats();
    GTApp.toast('Đã xóa tour thành công!', 'info');
  }
}

function handleSaveTour(e) {
  e.preventDefault();
  const id = document.getElementById('tour-crud-id').value;
  const imgVal = document.getElementById('t-img').value.trim() || FALLBACK_IMG;

  const tourData = {
    name: document.getElementById('t-name').value.trim(),
    badge: document.getElementById('t-badge').value,
    destination: document.getElementById('t-destination').value.trim(),
    region: document.getElementById('t-region').value,
    type: document.getElementById('t-type').value,
    days: parseInt(document.getElementById('t-days').value) || 3,
    nights: parseInt(document.getElementById('t-nights').value) || 2,
    departFrom: document.getElementById('t-depart').value.trim(),
    price: parseInt(document.getElementById('t-price').value) || 2000000,
    oldPrice: parseInt(document.getElementById('t-oldprice').value) || null,
    images: [imgVal, PHOTOS.beach1, PHOTOS.mountain1],
    overview: document.getElementById('t-overview').value.trim()
  };
  if (id) tourData.id = id;

  GTStore.saveTour(tourData);
  bootstrap.Modal.getInstance(document.getElementById('tourModal')).hide();
  loadAdminTours();
  loadDashboardStats();
  GTApp.toast(id ? 'Cập nhật tour thành công!' : 'Thêm tour mới thành công!', 'success');
}

function filterAdminOrders(status, btn) {
  adminOrderFilter = status;
  document.querySelectorAll('#admin-order-filters .btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadAdminOrders();
}

function loadAdminOrders() {
  const orders = GTStore.getOrders();
  const filtered = orders.filter(o => adminOrderFilter === 'all' || o.status === adminOrderFilter);
  const tbody = document.getElementById('admin-orders-tbody');

  const statusMap = {
    pending: { text: 'Chờ thanh toán', class: 'st-pending' },
    paid: { text: 'Đã thanh toán', class: 'st-paid' },
    confirmed: { text: 'Đã xác nhận', class: 'st-confirmed' },
    completed: { text: 'Hoàn thành', class: 'st-completed' },
    cancelled: { text: 'Đã hủy', class: 'st-cancelled' }
  };

  tbody.innerHTML = filtered.map(o => {
    const st = statusMap[o.status] || { text: o.status, class: 'st-pending' };
    return `
      <tr>
        <td><strong class="font-monospace text-primary">${o.code}</strong></td>
        <td>
          <strong>${o.customer?.name || 'Khách'}</strong>
          <small class="text-muted d-block">${o.customer?.phone || ''}</small>
        </td>
        <td><span class="text-truncate d-inline-block" style="max-width:180px;">${o.tourName}</span></td>
        <td>${GTApp.formatDateVN(o.createdAt)}</td>
        <td><strong class="text-orange">${GTApp.formatVND(o.total)}</strong></td>
        <td><span class="status ${st.class}">${st.text}</span></td>
        <td class="text-end">
          <select class="form-select form-select-sm d-inline-block" style="width:145px;" onchange="changeOrderStatus('${o.code}', this.value)">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ thanh toán</option>
            <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>Đã thanh toán</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
            <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function changeOrderStatus(code, newStatus) {
  GTStore.updateOrderStatus(code, newStatus);
  loadAdminOrders();
  loadDashboardStats();
  GTApp.toast(`Đã cập nhật đơn hàng ${code} sang ${newStatus}!`, 'success');
}

function loadAdminCustomers() {
  const users = GTStore.getUsers();
  const tbody = document.getElementById('admin-customers-tbody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><span class="text-muted">#${u.id}</span></td>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td>${u.phone || '--'}</td>
      <td><span class="badge ${u.role === 'admin' ? 'bg-primary' : 'bg-light text-muted'}">${u.role}</span></td>
      <td>
        <span class="badge ${u.status === 'active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
          ${u.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      </td>
      <td class="text-end">
        ${u.role !== 'admin' ? `
          <button class="btn btn-sm ${u.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}" onclick="toggleCustomerStatus(${u.id})">
            ${u.status === 'active' ? '<i class="bi bi-lock me-1"></i>Khóa' : '<i class="bi bi-unlock me-1"></i>Mở khóa'}
          </button>
        ` : '<small class="text-muted">Admin gốc</small>'}
      </td>
    </tr>
  `).join('');
}

function toggleCustomerStatus(id) {
  GTStore.toggleUserStatus(id);
  loadAdminCustomers();
  GTApp.toast('Đã cập nhật trạng thái khách hàng!', 'info');
}

function loadAdminCoupons() {
  const coupons = GTStore.getCoupons();
  const tbody = document.getElementById('admin-coupons-tbody');
  tbody.innerHTML = coupons.map(c => `
    <tr>
      <td><span class="coupon-code">${c.code}</span></td>
      <td><strong>${c.type === 'percent' ? `${c.value}%` : GTApp.formatVND(c.value)}</strong></td>
      <td>${c.minOrder ? GTApp.formatVND(c.minOrder) : '0đ'}</td>
      <td>${c.desc || ''}</td>
      <td><span class="badge bg-success">Hoạt động</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCoupon('${c.code}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openCouponModal() {
  new bootstrap.Modal(document.getElementById('couponModal')).show();
}

function handleSaveCoupon(e) {
  e.preventDefault();
  const code = document.getElementById('cp-code').value.trim().toUpperCase();
  const type = document.getElementById('cp-type').value;
  const value = parseInt(document.getElementById('cp-value').value);
  const desc = document.getElementById('cp-desc').value.trim();

  GTStore.saveCoupon({ code, type, value, max: 2000000, minOrder: 0, desc, active: true });
  bootstrap.Modal.getInstance(document.getElementById('couponModal')).hide();
  loadAdminCoupons();
  GTApp.toast(`Đã tạo mã giảm giá ${code}!`, 'success');
}

function deleteCoupon(code) {
  if (confirm(`Bạn có chắc muốn xóa mã ${code}?`)) {
    GTStore.deleteCoupon(code);
    loadAdminCoupons();
    GTApp.toast('Đã xóa mã giảm giá', 'info');
  }
}

function adminLogout() {
  GTStore.logout();
  window.location.href = 'login.html';
}
