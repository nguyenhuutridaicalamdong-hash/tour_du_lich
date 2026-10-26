/* =========================================================
   GoTravel - Payment Controller & VNPay Gateway Integration
   ========================================================= */

let currentOrder = null;
let selectedMethod = 'card';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('site-header-container').innerHTML = GTApp.getHeaderHTML('tours');
  document.getElementById('site-footer-container').innerHTML = GTApp.getFooterHTML();
  GTApp.updateHeaderUser();
  GTApp.updateCartBadge();
  GTApp.setupSearchOverlay();

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const orders = GTStore.getOrders();

  if (code) {
    currentOrder = GTStore.getOrderByCode(code);
  }
  if (!currentOrder && orders.length > 0) {
    currentOrder = orders[0];
  }

  if (!currentOrder) {
    alert('Không tìm thấy thông tin đơn hàng!');
    window.location.href = 'tours.html';
    return;
  }

  renderOrderInfo();
});

function renderOrderInfo() {
  const o = currentOrder;
  document.getElementById('order-img').src = o.image || FALLBACK_IMG;
  document.getElementById('order-tour-name').textContent = o.tourName;
  document.getElementById('order-code-display').textContent = o.code;
  document.getElementById('order-dep-date').textContent = GTApp.formatDateVN(o.date);
  document.getElementById('order-cust-name').textContent = o.customer ? o.customer.name : 'Khách hàng';
  document.getElementById('order-cust-phone').textContent = o.customer ? o.customer.phone : '--';
  document.getElementById('order-cust-email').textContent = o.customer ? o.customer.email : '--';
  document.getElementById('order-guests-count').textContent = `${o.adults} người lớn, ${o.children || 0} trẻ em`;

  document.getElementById('order-subtotal').textContent = GTApp.formatVND(o.subtotal || o.total);
  document.getElementById('order-tour-discount').textContent = `-${GTApp.formatVND(o.discount || 0)}`;

  if (o.couponCode && o.couponDiscount) {
    document.getElementById('order-coupon-row').style.display = 'flex';
    document.getElementById('order-coupon-code').textContent = o.couponCode;
    document.getElementById('order-coupon-discount').textContent = `-${GTApp.formatVND(o.couponDiscount)}`;
  }

  const totalFormatted = GTApp.formatVND(o.total);
  document.getElementById('order-total-amount').textContent = totalFormatted;
  document.getElementById('btn-pay-amount').textContent = totalFormatted;
  document.getElementById('bank-amount-display').textContent = totalFormatted;
  document.getElementById('bank-content-display').textContent = o.code;

  // QR Code with real order code & amount
  const qrData = encodeURIComponent(`2|99|0909999999|GOTRAVEL|${o.code}|${o.total}|Thanh toan don hang ${o.code}`);
  document.getElementById('vietqr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;
}

function selectPaymentMethod(method) {
  selectedMethod = method;
  document.querySelectorAll('.pay-method').forEach(m => {
    m.classList.remove('selected');
    const icon = m.querySelector('.pm-check');
    if (icon) {
      icon.className = 'bi bi-circle text-muted fs-5 pm-check';
    }
  });

  const activeMethodEl = document.getElementById(`method-${method}`);
  activeMethodEl.classList.add('selected');
  const activeIcon = activeMethodEl.querySelector('.pm-check');
  if (activeIcon) {
    activeIcon.className = 'bi bi-check-circle-fill text-primary fs-5 pm-check';
  }

  document.getElementById('card-details-panel').classList.toggle('d-none', method !== 'card');
  document.getElementById('bank-details-panel').classList.toggle('d-none', method !== 'bank');
  document.getElementById('ewallet-details-panel').classList.toggle('d-none', method !== 'ewallet');
}

/**
 * Handle Payment:
 * 1. If backend API is active at localhost:5000/5001 or configured endpoint, redirect to VNPay Gateway URL.
 * 2. Fallback to client-side simulated payment if backend is offline.
 */
async function executePayment() {
  const payBtn = document.getElementById('btn-pay-now');
  const loading = document.getElementById('payment-loading');

  payBtn.disabled = true;
  payBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Đang chuẩn bị cổng thanh toán...';
  loading.classList.remove('d-none');

  // Try calling ASP.NET Core VNPay payment URL
  const backendApiUrl = 'http://localhost:5000/api/payment/vnpay-url';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${backendApiUrl}?orderCode=${encodeURIComponent(currentOrder.code)}&amount=${currentOrder.total}&orderInfo=${encodeURIComponent('Thanh toan don hang ' + currentOrder.code)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
    }
  } catch (err) {
    // Backend offline or timeout -> proceed with simulated instant payment
    console.info('ASP.NET Core API not reachable, falling back to simulated payment workflow:', err);
  }

  // Fallback simulated payment
  setTimeout(() => {
    currentOrder.status = 'paid';
    currentOrder.method = selectedMethod;
    currentOrder.paidAt = new Date().toISOString();
    GTStore.saveOrder(currentOrder);

    // Remove from cart if matching tour
    const cart = GTStore.getCart().filter(item => item.tourId !== currentOrder.tourId);
    localStorage.setItem(GTStore.KEYS.CART, JSON.stringify(cart));
    GTApp.updateCartBadge();

    GTApp.toast('Thanh toán thành công! Đang chuyển hướng...', 'success');

    setTimeout(() => {
      window.location.href = `payment-success.html?code=${currentOrder.code}`;
    }, 800);
  }, 1500);
}

// Alias for backwards compatibility
function executeMockPayment() {
  executePayment();
}
