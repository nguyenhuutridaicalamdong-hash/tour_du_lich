/* =========================================================
   GoTravel - Client API Service (Connect to ASP.NET Core & SQL Server)
   ========================================================= */

const GTApi = {
  baseUrl: 'http://localhost:5000/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });
      if (!res.ok) {
        let errMessage = `Lỗi HTTP ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && (errData.message || errData.title)) errMessage = errData.message || errData.title;
        } catch {}
        return { success: false, status: res.status, message: errMessage };
      }
      if (res.status === 204) return { success: true, data: null };
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.warn(`[GTApi] Request failed for ${url}:`, err);
      return { success: false, error: err, message: 'Không thể kết nối đến máy chủ Backend' };
    }
  },

  /* Tours */
  async getTours(params = {}) {
    const q = new URLSearchParams(params).toString();
    const endpoint = `/tours${q ? '?' + q : ''}`;
    return this.request(endpoint);
  },
  async getTourById(id) {
    return this.request(`/tours/${id}`);
  },
  async createTour(tour) {
    return this.request('/tours', { method: 'POST', body: JSON.stringify(tour) });
  },
  async updateTour(id, tour) {
    return this.request(`/tours/${id}`, { method: 'PUT', body: JSON.stringify(tour) });
  },
  async deleteTour(id) {
    return this.request(`/tours/${id}`, { method: 'DELETE' });
  },

  /* Orders */
  async getOrders(params = {}) {
    const q = new URLSearchParams(params).toString();
    const endpoint = `/orders${q ? '?' + q : ''}`;
    return this.request(endpoint);
  },
  async getOrderByCode(code) {
    return this.request(`/orders/${code}`);
  },
  async createOrder(order) {
    return this.request('/orders', { method: 'POST', body: JSON.stringify(order) });
  },
  async updateOrderStatus(code, status) {
    return this.request(`/orders/${code}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  /* Auth */
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  async register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /* Users (Admin) */
  async getUsers() {
    return this.request('/users');
  },
  async toggleUserStatus(id) {
    return this.request(`/users/${id}/toggle-status`, { method: 'PATCH' });
  },

  /* Vouchers */
  async getVouchers() {
    return this.request('/vouchers');
  },
  async getVoucherByCode(code) {
    return this.request(`/vouchers/${encodeURIComponent(code)}`);
  },
  async createVoucher(voucher) {
    return this.request('/vouchers', { method: 'POST', body: JSON.stringify(voucher) });
  },
  async deleteVoucher(code) {
    return this.request(`/vouchers/${encodeURIComponent(code)}`, { method: 'DELETE' });
  },

  /* VNPay */
  async getVnPayUrl(orderCode, amount, orderInfo) {
    return this.request(`/payment/vnpay-url?orderCode=${encodeURIComponent(orderCode)}&amount=${amount}&orderInfo=${encodeURIComponent(orderInfo)}`);
  }
};
