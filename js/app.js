/* =========================================================
   GoTravel - Core Application & Data Store
   ========================================================= */

const GTStore = {
  KEYS: {
    TOURS: 'gt_tours_v1',
    USERS: 'gt_users_v1',
    ORDERS: 'gt_orders_v1',
    COUPONS: 'gt_coupons_v1',
    CART: 'gt_cart_v1',
    FAVS: 'gt_favs_v1',
    AUTH: 'gt_auth_user_v1'
  },

  init() {
    if (!localStorage.getItem(this.KEYS.TOURS)) {
      localStorage.setItem(this.KEYS.TOURS, JSON.stringify(DEFAULT_TOURS));
    }
    if (!localStorage.getItem(this.KEYS.USERS)) {
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(this.KEYS.ORDERS)) {
      localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(seedOrders()));
    }
    if (!localStorage.getItem(this.KEYS.COUPONS)) {
      localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
    }
    if (!localStorage.getItem(this.KEYS.CART)) {
      // Seed initial 1 item for friendly demo
      const t = DEFAULT_TOURS[0];
      const deps = getDepartures(t);
      localStorage.setItem(this.KEYS.CART, JSON.stringify([{
        tourId: t.id,
        name: t.name,
        image: t.images[0],
        price: t.price,
        oldPrice: t.oldPrice,
        date: deps[0].date,
        returnDate: deps[0].returnDate,
        adults: 2,
        children: 0,
        departFrom: t.departFrom
      }]));
    }
    if (!localStorage.getItem(this.KEYS.FAVS)) {
      localStorage.setItem(this.KEYS.FAVS, JSON.stringify([1, 2]));
    }
    // Only set initial demo user on the very first visit if user hasn't explicitly logged out
    if (!localStorage.getItem('gt_system_bootstrapped_v1')) {
      localStorage.setItem('gt_system_bootstrapped_v1', 'true');
      if (!localStorage.getItem(this.KEYS.AUTH) && !localStorage.getItem('gt_explicit_logout')) {
        localStorage.setItem(this.KEYS.AUTH, JSON.stringify(DEFAULT_USERS[0]));
      }
    }
  },

  /* Tours */
  getTours() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.TOURS)) || DEFAULT_TOURS;
    } catch {
      return DEFAULT_TOURS;
    }
  },
  getTourById(id) {
    const tours = this.getTours();
    return tours.find(t => String(t.id) === String(id));
  },
  saveTour(tour) {
    const tours = this.getTours();
    if (tour.id) {
      const idx = tours.findIndex(t => String(t.id) === String(tour.id));
      if (idx !== -1) tours[idx] = { ...tours[idx], ...tour };
      else tours.unshift(tour);
    } else {
      tour.id = Date.now();
      tour.createdAt = new Date().toISOString().slice(0, 10);
      tours.unshift(tour);
    }
    localStorage.setItem(this.KEYS.TOURS, JSON.stringify(tours));
    return tour;
  },
  deleteTour(id) {
    const tours = this.getTours().filter(t => String(t.id) !== String(id));
    localStorage.setItem(this.KEYS.TOURS, JSON.stringify(tours));
  },

  /* Orders */
  getOrders() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.ORDERS)) || [];
    } catch {
      return [];
    }
  },
  getOrderByCode(code) {
    return this.getOrders().find(o => o.code === code);
  },
  saveOrder(order) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.code === order.code);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...order };
    } else {
      orders.unshift(order);
    }
    localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    return order;
  },
  updateOrderStatus(code, status) {
    const orders = this.getOrders();
    const o = orders.find(x => x.code === code);
    if (o) {
      o.status = status;
      localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    }
    return o;
  },

  /* Coupons */
  getCoupons() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.COUPONS)) || DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  },
  saveCoupon(coupon) {
    const list = this.getCoupons();
    const idx = list.findIndex(c => c.code === coupon.code);
    if (idx !== -1) list[idx] = coupon;
    else list.push(coupon);
    localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(list));
  },
  deleteCoupon(code) {
    const list = this.getCoupons().filter(c => c.code !== code);
    localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(list));
  },
  findCoupon(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return this.getCoupons().find(c => c.code.toUpperCase() === clean && c.active);
  },

  /* Cart */
  getCart() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CART)) || [];
    } catch {
      return [];
    }
  },
  addToCart(item) {
    const cart = this.getCart();
    cart.unshift(item);
    localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
    GTApp.updateCartBadge();
  },
  removeFromCart(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
    GTApp.updateCartBadge();
  },
  clearCart() {
    localStorage.setItem(this.KEYS.CART, JSON.stringify([]));
    GTApp.updateCartBadge();
  },

  /* Favorites */
  getFavorites() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.FAVS)) || [];
    } catch {
      return [];
    }
  },
  toggleFavorite(id) {
    let favs = this.getFavorites();
    const numId = Number(id);
    if (favs.includes(numId)) {
      favs = favs.filter(x => x !== numId);
      GTApp.toast('Đã xóa khỏi tour yêu thích', 'info');
    } else {
      favs.push(numId);
      GTApp.toast('Đã lưu vào tour yêu thích!', 'success');
    }
    localStorage.setItem(this.KEYS.FAVS, JSON.stringify(favs));
    document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => {
      btn.classList.toggle('active', favs.includes(numId));
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = favs.includes(numId) ? 'bi bi-heart-fill text-danger' : 'bi bi-heart';
      }
    });
    return favs.includes(numId);
  },
  isFavorite(id) {
    return this.getFavorites().includes(Number(id));
  },

  /* Users / Auth */
  getUsers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },
  getCurrentUser() {
    this.init();
    try {
      const raw = localStorage.getItem(this.KEYS.AUTH);
      if (!raw || raw === 'null' || raw === 'undefined') return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(this.KEYS.AUTH);
      localStorage.setItem('gt_explicit_logout', 'true');
    } else {
      localStorage.setItem(this.KEYS.AUTH, JSON.stringify(user));
      localStorage.removeItem('gt_explicit_logout');
    }
    GTApp.updateHeaderUser();
  },
  login(email, password) {
    const users = this.getUsers();
    const u = users.find(x => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return { success: false, message: 'Email không tồn tại trong hệ thống' };
    if (u.password !== password) return { success: false, message: 'Mật khẩu không chính xác' };
    if (u.status === 'locked') return { success: false, message: 'Tài khoản đang bị tạm khóa' };
    this.setCurrentUser(u);
    return { success: true, user: u };
  },
  register(userData) {
    const users = this.getUsers();
    if (users.some(x => x.email.toLowerCase() === userData.email.trim().toLowerCase())) {
      return { success: false, message: 'Email đã được đăng ký' };
    }
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      password: userData.password,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    users.push(newUser);
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },
  logout() {
    this.setCurrentUser(null);
  },
  toggleUserStatus(id) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (u) {
      u.status = u.status === 'active' ? 'locked' : 'active';
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    }
    return u;
  }
};

/* =========================================================
   UI & Presentation Helpers
   ========================================================= */

const GTApp = {
  init() {
    GTStore.init();
    this.setupHeaderScroll();
    this.updateCartBadge();
    this.updateHeaderUser();
    this.setupSearchOverlay();
    this.setupAnimations();
  },

  formatVND(num) {
    if (num == null || isNaN(num)) return '0đ';
    return Number(num).toLocaleString('vi-VN') + 'đ';
  },

  formatDateVN(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.slice(0, 10).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {}
    return dateStr;
  },

  toast(message, type = 'info') {
    let zone = document.getElementById('toast-zone');
    if (!zone) {
      zone = document.createElement('div');
      zone.id = 'toast-zone';
      document.body.appendChild(zone);
    }
    const t = document.createElement('div');
    t.className = `gt-toast ${type}`;
    let iconClass = 'bi-info-circle-fill';
    if (type === 'success') iconClass = 'bi-check-circle-fill';
    if (type === 'error' || type === 'danger') iconClass = 'bi-x-circle-fill';
    if (type === 'warning') iconClass = 'bi-exclamation-triangle-fill';

    t.innerHTML = `
      <i class="bi ${iconClass}"></i>
      <div style="flex:1;">${message}</div>
      <button type="button" class="btn-close btn-close-sm" style="font-size:.7rem" onclick="this.parentElement.remove()"></button>
    `;
    zone.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(40px)';
      t.style.transition = 'all .3s ease';
      setTimeout(() => t.remove(), 300);
    }, 3500);
  },

  setupHeaderScroll() {
    const hdr = document.querySelector('.site-header');
    if (!hdr) return;
    const onScroll = () => {
      if (window.scrollY > 20) hdr.classList.add('scrolled');
      else hdr.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const cart = GTStore.getCart();
    const count = cart.length;
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'grid' : 'none';
    });
  },

  updateHeaderUser() {
    const userContainer = document.getElementById('header-user-zone');
    if (!userContainer) return;
    const user = GTStore.getCurrentUser();
    if (user) {
      const firstLetter = (user.name || user.email).charAt(0).toUpperCase();
      const isAdmin = user.role === 'admin';
      userContainer.innerHTML = `
        <div class="dropdown">
          <button class="user-chip btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="border:none;">
            <div class="avatar">${firstLetter}</div>
            <span class="d-none d-md-inline fw-semibold text-navy text-truncate" style="max-width:130px;">${user.name}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li class="px-3 py-2 border-bottom">
              <div class="fw-bold text-navy">${user.name}</div>
              <small class="text-muted text-truncate d-block">${user.email}</small>
              <span class="badge ${isAdmin ? 'bg-primary' : 'bg-light text-muted border'} mt-1">${isAdmin ? 'Quản trị viên' : 'Khách hàng'}</span>
            </li>
            ${isAdmin ? `
              <li><a class="dropdown-item py-2 fw-semibold text-primary" href="admin.html"><i class="bi bi-shield-lock me-2"></i>Trang quản trị (Admin)</a></li>
              <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2 text-primary"></i>Thông tin tài khoản</a></li>
            ` : `
              <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2 text-primary"></i>Tài khoản cá nhân</a></li>
              <li><a class="dropdown-item py-2" href="profile.html?tab=orders"><i class="bi bi-receipt me-2 text-primary"></i>Đơn hàng của tôi</a></li>
              <li><a class="dropdown-item py-2" href="profile.html?tab=favs"><i class="bi bi-heart me-2 text-primary"></i>Tour yêu thích</a></li>
            `}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item py-2 text-danger" href="javascript:void(0)" onclick="GTApp.logout()"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a></li>
          </ul>
        </div>
      `;
    } else {
      userContainer.innerHTML = `
        <a href="login.html" class="btn btn-outline-gt btn-sm me-2 d-none d-sm-inline-flex">Đăng nhập</a>
        <a href="register.html" class="btn btn-gt btn-sm">Đăng ký</a>
      `;
    }
  },

  logout() {
    GTStore.logout();
    GTApp.updateHeaderUser();
    GTApp.toast('Đã đăng xuất tài khoản thành công!', 'info');
    setTimeout(() => {
      const loc = (window.location.pathname || '').toLowerCase();
      if (loc.includes('profile') || loc.includes('admin')) {
        window.location.href = 'index.html';
      } else {
        window.location.reload();
      }
    }, 400);
  },

  setupSearchOverlay() {
    const triggers = document.querySelectorAll('[data-open-search]');
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    triggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.add('show');
        const inp = overlay.querySelector('input');
        if (inp) setTimeout(() => inp.focus(), 100);
      });
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-close-search]')) {
        overlay.classList.remove('show');
      }
    });
  },

  setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },

  /* Generate Tour Card HTML */
  createTourCardHTML(tour) {
    const isFav = GTStore.isFavorite(tour.id);
    let badgeClass = 'b-new';
    if (tour.badge === 'Bán chạy') badgeClass = 'b-hot';
    else if (tour.badge === 'Khuyến mãi') badgeClass = 'b-sale';
    else if (tour.badge === 'Yêu thích') badgeClass = 'b-love';

    const discountPercent = tour.oldPrice ? Math.round(((tour.oldPrice - tour.price) / tour.oldPrice) * 100) : 0;
    const coverImg = (tour.images && tour.images[0]) || FALLBACK_IMG;

    return `
      <div class="col-12 col-md-6 col-lg-3">
        <div class="tour-card" onclick="window.location.href='tour-detail.html?id=${tour.id}'">
          <div class="tour-thumb">
            <img src="${coverImg}" alt="${tour.name}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
            <span class="tour-badge ${badgeClass}">${tour.badge || 'Nổi bật'}</span>
            <button class="fav-btn ${isFav ? 'active' : ''}" data-fav-id="${tour.id}" title="Yêu thích" onclick="event.stopPropagation(); GTStore.toggleFavorite(${tour.id})">
              <i class="bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
            </button>
          </div>
          <div class="tour-body">
            <h5 class="tour-title" title="${tour.name}">${tour.name}</h5>
            <div class="tour-meta">
              <span><i class="bi bi-clock"></i>${tour.days} ngày ${tour.nights} đêm</span>
              <span><i class="bi bi-geo-alt"></i>${tour.departFrom}</span>
            </div>
            <div class="tour-rating mb-2">
              <span class="stars"><i class="bi bi-star-fill"></i></span>
              <strong class="text-navy ms-1">${tour.rating || 4.8}</strong>
              <small class="text-muted">(${tour.reviews || 120} đánh giá)</small>
            </div>
            <div class="tour-foot">
              <div>
                ${tour.oldPrice ? `<div class="price-old">${this.formatVND(tour.oldPrice)}</div>` : ''}
                <div class="d-flex align-items-center">
                  <span class="price-now">${this.formatVND(tour.price)}</span>
                  ${discountPercent > 0 ? `<span class="discount-tag">-${discountPercent}%</span>` : ''}
                </div>
              </div>
              <span class="arrow-btn" title="Xem chi tiết">
                <i class="bi bi-arrow-right"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* Generate Header Component HTML */
  getHeaderHTML(activePage = '') {
    const isHome = activePage === 'home' ? 'active' : '';
    const isTours = activePage === 'tours' ? 'active' : '';
    const isPromos = activePage === 'promos' ? 'active' : '';
    const isAbout = activePage === 'about' ? 'active' : '';
    const isContact = activePage === 'contact' ? 'active' : '';

    return `
      <header class="site-header">
        <div class="container h-100">
          <nav class="navbar navbar-expand-lg h-100">
            <a class="brand" href="index.html">
              <div class="brand-icon">
                <i class="bi bi-send-fill"></i>
              </div>
              <div>
                <div class="brand-name">Go<span>Travel</span></div>
                <div class="brand-slogan">Khám phá thế giới, cùng bạn</div>
              </div>
            </a>

            <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#gtNav" aria-controls="gtNav" aria-expanded="false" aria-label="Toggle navigation">
              <i class="bi bi-list fs-2 text-navy"></i>
            </button>

            <div class="collapse navbar-collapse" id="gtNav">
              <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                <li class="nav-item"><a class="nav-link ${isHome}" href="index.html">Trang chủ</a></li>
                <li class="nav-item"><a class="nav-link ${isTours}" href="tours.html">Tour du lịch</a></li>
                <li class="nav-item"><a class="nav-link ${isPromos}" href="promotions.html">Khuyến mãi</a></li>
                <li class="nav-item"><a class="nav-link ${isAbout}" href="about.html">Về chúng tôi</a></li>
                <li class="nav-item"><a class="nav-link ${isContact}" href="contact.html">Liên hệ</a></li>
              </ul>

              <div class="d-flex align-items-center gap-2">
                <button class="icon-btn" data-open-search title="Tìm kiếm">
                  <i class="bi bi-search"></i>
                </button>
                <a href="cart.html" class="icon-btn" title="Giỏ hàng">
                  <i class="bi bi-bag"></i>
                  <span class="cart-badge" style="display:none">0</span>
                </a>
                <div id="header-user-zone" class="d-flex align-items-center"></div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <!-- Global Search Overlay -->
      <div id="search-overlay" class="search-overlay">
        <div class="search-overlay-box">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-navy m-0"><i class="bi bi-search text-primary me-2"></i>Tìm tour du lịch</h5>
            <button class="btn-close" data-close-search aria-label="Close"></button>
          </div>
          <form onsubmit="event.preventDefault(); const q = this.searchQ.value.trim(); if(q) window.location.href='tours.html?q=' + encodeURIComponent(q);">
            <div class="input-group mb-3">
              <input type="text" name="searchQ" class="form-control form-control-lg" placeholder="Nhập tên tour, điểm đến (ví dụ: Hạ Long, Đà Lạt...)" autofocus>
              <button class="btn btn-orange px-4" type="submit">Tìm kiếm</button>
            </div>
          </form>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <small class="text-muted">Gợi ý:</small>
            <a href="tours.html?dest=Hạ Long" class="chip-active">Hạ Long</a>
            <a href="tours.html?dest=Đà Nẵng" class="chip-active">Đà Nẵng</a>
            <a href="tours.html?dest=Phú Quốc" class="chip-active">Phú Quốc</a>
            <a href="tours.html?dest=Đà Lạt" class="chip-active">Đà Lạt</a>
            <a href="tours.html?dest=Sa Pa" class="chip-active">Sa Pa</a>
          </div>
        </div>
      </div>
    `;
  },

  /* Generate Footer Component HTML */
  getFooterHTML() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="row g-4">
            <div class="col-12 col-md-4">
              <a class="brand mb-3 d-inline-flex" href="index.html">
                <div class="brand-icon">
                  <i class="bi bi-send-fill"></i>
                </div>
                <div>
                  <div class="brand-name">Go<span style="color:#4fb0ff;">Travel</span></div>
                  <div class="brand-slogan" style="color:rgba(255,255,255,.6);">Khám phá thế giới, cùng bạn</div>
                </div>
              </a>
              <p class="small text-muted-2 pe-lg-4" style="color:rgba(255,255,255,.7) !important; line-height:1.7;">
                GoTravel là nền tảng đặt tour du lịch hàng đầu Việt Nam. Chúng tôi cam kết mang lại những hành trình trọn vẹn, an toàn, chất lượng cao với chi phí tối ưu nhất cho bạn và gia đình.
              </p>
              <div class="social mt-3">
                <a href="javascript:void(0)" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                <a href="javascript:void(0)" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                <a href="javascript:void(0)" aria-label="Youtube"><i class="bi bi-youtube"></i></a>
                <a href="javascript:void(0)" aria-label="Tiktok"><i class="bi bi-tiktok"></i></a>
              </div>
            </div>

            <div class="col-6 col-md-2">
              <h6>GoTravel</h6>
              <ul>
                <li><a href="about.html">Về chúng tôi</a></li>
                <li><a href="tours.html">Tour du lịch</a></li>
                <li><a href="promotions.html">Khuyến mãi</a></li>
                <li><a href="contact.html">Liên hệ</a></li>
                <li><a href="admin.html" class="text-warning"><i class="bi bi-speedometer2 me-1"></i>Trang Admin</a></li>
              </ul>
            </div>

            <div class="col-6 col-md-3">
              <h6>Chính sách & Hỗ trợ</h6>
              <ul>
                <li><a href="javascript:void(0)" onclick="alert('Chính sách đặt tour: Đặt tour trực tuyến 24/7, xác nhận tức thì.')">Chính sách đặt tour</a></li>
                <li><a href="javascript:void(0)" onclick="alert('Chính sách hoàn/hủy: Miễn phí hủy trước 15 ngày, hoàn tiền trong 24h.')">Chính sách hoàn/hủy</a></li>
                <li><a href="javascript:void(0)" onclick="alert('Điều khoản dịch vụ: Cam kết bảo vệ quyền lợi khách hàng theo pháp luật.')">Điều khoản dịch vụ</a></li>
                <li><a href="javascript:void(0)" onclick="alert('Bảo mật: Mã hóa thông tin cá nhân và thanh toán an toàn tuyệt đối.')">Chính sách bảo mật</a></li>
                <li><a href="profile.html?tab=orders">Tra cứu đơn hàng</a></li>
              </ul>
            </div>

            <div class="col-12 col-md-3">
              <h6>Thông tin liên hệ</h6>
              <ul class="text-white-50">
                <li class="d-flex gap-2"><i class="bi bi-geo-alt text-primary"></i> 70 Tô Ký, P. Tân Chánh Hiệp, Q.12, TP.HCM</li>
                <li class="d-flex gap-2"><i class="bi bi-telephone text-primary"></i> <strong>Hotline:</strong> 1900 6868 (24/7)</li>
                <li class="d-flex gap-2"><i class="bi bi-envelope text-primary"></i> <strong>Email:</strong> support@gotravel.vn</li>
                <li class="d-flex gap-2"><i class="bi bi-clock text-primary"></i> 08:00 - 21:00 hàng ngày</li>
              </ul>
              <div class="p-2 rounded mt-2" style="background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);">
                <small class="text-white-50 d-block mb-1">Phương thức thanh toán bảo mật:</small>
                <div class="d-flex gap-2 align-items-center text-white fs-5">
                  <i class="bi bi-credit-card-2-front" title="Thẻ Visa/Mastercard"></i>
                  <i class="bi bi-qr-code" title="VietQR Ngân hàng"></i>
                  <i class="bi bi-wallet2" title="Ví điện tử MoMo/ZaloPay"></i>
                  <i class="bi bi-shield-check text-success" title="Bảo mật SSL"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div>© 2026 GoTravel. Bản quyền thuộc về Hệ thống bán hàng và thanh toán du lịch GoTravel.</div>
            <div class="text-white-50 small">Thiết kế bởi GoTravel Team • Hiện đại • Trẻ trung • Dễ sử dụng</div>
          </div>
        </div>
      </footer>
    `;
  }
};

// Global init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  GTApp.init();
});
