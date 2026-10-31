/* =========================================================
   GoTravel - Admin Portal Controller (Direct SQL Server & API Sync)
   ========================================================= */

let adminOrderFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  GTStore.init();
  // Ensure user is recognized as admin
  const u = GTStore.getCurrentUser();
  if (!u || u.role !== 'admin') {
    alert('Trang Quản trị yêu cầu quyền Admin. Vui lòng đăng nhập bằng tài khoản Quản trị viên (admin@gotravel.vn / admin123).');
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('admin-user-name').textContent = u.name || 'Quản trị viên';

  await loadDashboardStats();
  await loadAdminTours();
  await loadAdminOrders();
  await loadAdminCustomers();
  await loadAdminCoupons();
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

async function loadDashboardStats() {
  let orders = GTStore.getOrders();
  let tours = GTStore.getTours();
  let users = GTStore.getUsers();

  if (typeof GTApi !== 'undefined') {
    const [resO, resT, resU] = await Promise.all([
      GTApi.getOrders(),
      GTApi.getTours(),
      GTApi.getUsers()
    ]);
    if (resO.success && Array.isArray(resO.data)) orders = resO.data;
    if (resT.success && Array.isArray(resT.data)) tours = resT.data;
    if (resU.success && Array.isArray(resU.data)) users = resU.data;
  }

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

async function loadAdminTours() {
  let tours = GTStore.getTours();
  if (typeof GTApi !== 'undefined') {
    const res = await GTApi.getTours();
    if (res.success && Array.isArray(res.data)) {
      tours = res.data;
      localStorage.setItem(GTStore.KEYS.TOURS, JSON.stringify(tours));
    }
  }

  const tbody = document.getElementById('admin-tours-tbody');
  tbody.innerHTML = tours.map(t => {
    const img = (t.images && t.images[0]) || (t.imagesJson ? JSON.parse(t.imagesJson || '[]')[0] : FALLBACK_IMG) || FALLBACK_IMG;
    return `
      <tr>
        <td><img src="${img}" style="width:48px;height:38px;object-fit:cover;border-radius:8px;"></td>
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
    `;
  }).join('');
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
  
  let coverImg = '';
  if (tour) {
    if (tour.images && tour.images[0]) coverImg = tour.images[0];
    else if (tour.imagesJson) {
      try { coverImg = JSON.parse(tour.imagesJson)[0] || ''; } catch {}
    }
  }
  document.getElementById('t-img').value = coverImg;
  document.getElementById('t-overview').value = tour ? (tour.overview || '') : '';

  new bootstrap.Modal(document.getElementById('tourModal')).show();
}

function editTour(id) {
  const t = GTStore.getTourById(id);
  if (t) openTourModal(t);
}

async function deleteTour(id) {
  if (confirm('Bạn có chắc chắn muốn xóa tour này khỏi hệ thống?')) {
    if (typeof GTApi !== 'undefined') {
      await GTApi.deleteTour(id);
    }
    await GTStore.deleteTour(id);
    await loadAdminTours();
    await loadDashboardStats();
    GTApp.toast('Đã xóa tour thành công khỏi CSDL SQL Server!', 'info');
  }
}

async function handleSaveTour(e) {
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
    overview: document.getElementById('t-overview').value.trim(),
    status: 'active',
    featured: true
  };

  if (id) {
    tourData.id = parseInt(id) || id;
    if (typeof GTApi !== 'undefined') {
      await GTApi.updateTour(tourData.id, tourData);
    }
  } else {
    if (typeof GTApi !== 'undefined') {
      const res = await GTApi.createTour(tourData);
      if (res.success && res.data && res.data.id) tourData.id = res.data.id;
    }
  }

  await GTStore.saveTour(tourData);
  bootstrap.Modal.getInstance(document.getElementById('tourModal')).hide();
  await loadAdminTours();
  await loadDashboardStats();
  GTApp.toast(id ? 'Cập nhật tour thành công vào SQL Server!' : 'Thêm tour mới thành công vào SQL Server!', 'success');
}

function filterAdminOrders(status, btn) {
  adminOrderFilter = status;
  document.querySelectorAll('#admin-order-filters .btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadAdminOrders();
}

async function loadAdminOrders() {
  let orders = GTStore.getOrders();
  if (typeof GTApi !== 'undefined') {
    const res = await GTApi.getOrders();
    if (res.success && Array.isArray(res.data)) {
      orders = res.data;
      localStorage.setItem(GTStore.KEYS.ORDERS, JSON.stringify(orders));
    }
  }

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
    const customerName = o.customerName || (o.customer ? o.customer.name : 'Khách');
    const customerPhone = o.customerPhone || (o.customer ? o.customer.phone : '');

    return `
      <tr>
        <td><strong class="font-monospace text-primary">${o.code}</strong></td>
        <td>
          <strong>${customerName}</strong>
          <small class="text-muted d-block">${customerPhone}</small>
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

async function changeOrderStatus(code, newStatus) {
  if (typeof GTApi !== 'undefined') {
    await GTApi.updateOrderStatus(code, newStatus);
  }
  await GTStore.updateOrderStatus(code, newStatus);
  await loadAdminOrders();
  await loadDashboardStats();
  GTApp.toast(`Đã cập nhật đơn hàng ${code} sang ${newStatus}!`, 'success');
}

async function loadAdminCustomers() {
  let users = GTStore.getUsers();
  if (typeof GTApi !== 'undefined') {
    const res = await GTApi.getUsers();
    if (res.success && Array.isArray(res.data)) {
      users = res.data;
      localStorage.setItem(GTStore.KEYS.USERS, JSON.stringify(users));
    }
  }

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

async function toggleCustomerStatus(id) {
  if (typeof GTApi !== 'undefined') {
    await GTApi.toggleUserStatus(id);
  }
  await GTStore.toggleUserStatus(id);
  await loadAdminCustomers();
  GTApp.toast('Đã cập nhật trạng thái khách hàng trong SQL Server!', 'info');
}

async function loadAdminCoupons() {
  let coupons = GTStore.getCoupons();
  if (typeof GTApi !== 'undefined') {
    const res = await GTApi.getVouchers();
    if (res.success && Array.isArray(res.data)) {
      coupons = res.data;
      localStorage.setItem(GTStore.KEYS.COUPONS, JSON.stringify(coupons));
    }
  }

  const tbody = document.getElementById('admin-coupons-tbody');
  tbody.innerHTML = coupons.map(c => `
    <tr>
      <td><span class="coupon-code">${c.code}</span></td>
      <td><strong>${c.type === 'percent' ? `${c.value}%` : GTApp.formatVND(c.value)}</strong></td>
      <td>${c.minOrder ? GTApp.formatVND(c.minOrder) : '0đ'}</td>
      <td>${c.desc || c.description || ''}</td>
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

async function handleSaveCoupon(e) {
  e.preventDefault();
  const code = document.getElementById('cp-code').value.trim().toUpperCase();
  const type = document.getElementById('cp-type').value;
  const value = parseInt(document.getElementById('cp-value').value);
  const desc = document.getElementById('cp-desc').value.trim();

  const voucherData = { code, type, value, maxDiscount: 2000000, minOrder: 0, description: desc, isActive: true };

  if (typeof GTApi !== 'undefined') {
    await GTApi.createVoucher(voucherData);
  }
  await GTStore.saveCoupon(voucherData);

  bootstrap.Modal.getInstance(document.getElementById('couponModal')).hide();
  await loadAdminCoupons();
  GTApp.toast(`Đã tạo mã giảm giá ${code} trong SQL Server!`, 'success');
}

async function deleteCoupon(code) {
  if (confirm(`Bạn có chắc muốn xóa mã ${code}?`)) {
    if (typeof GTApi !== 'undefined') {
      await GTApi.deleteVoucher(code);
    }
    await GTStore.deleteCoupon(code);
    await loadAdminCoupons();
    GTApp.toast('Đã xóa mã giảm giá', 'info');
  }
}

function adminLogout() {
  GTStore.logout();
  window.location.href = 'login.html';
}
