/* =========================================================
   GoTravel - Booking Workflow (4 Steps) Controller
   ========================================================= */

let bookingTour = null;
let selectedDate = null;
let selectedReturnDate = null;
let adultsCount = 2;
let childrenCount = 0;
let appliedCoupon = null;
let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('site-header-container').innerHTML = GTApp.getHeaderHTML('tours');
  document.getElementById('site-footer-container').innerHTML = GTApp.getFooterHTML();
  GTApp.updateHeaderUser();
  GTApp.updateCartBadge();
  GTApp.setupSearchOverlay();

  // Parse parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get('tourId') || '1';
  bookingTour = GTStore.getTourById(tourId) || GTStore.getTours()[0];

  if (urlParams.get('adults')) adultsCount = Math.max(1, parseInt(urlParams.get('adults')));
  if (urlParams.get('children')) childrenCount = Math.max(0, parseInt(urlParams.get('children')));
  selectedDate = urlParams.get('date');
  selectedReturnDate = urlParams.get('returnDate');

  initBookingData();
});

function initBookingData() {
  const t = bookingTour;
  // Step 1 UI
  document.getElementById('step1-tour-img').src = t.images[0] || FALLBACK_IMG;
  document.getElementById('sidebar-tour-img').src = t.images[0] || FALLBACK_IMG;
  document.getElementById('step1-tour-name').textContent = t.name;
  document.getElementById('sidebar-tour-name').textContent = t.name;
  document.getElementById('step1-tour-dur').textContent = `${t.days} ngày ${t.nights} đêm`;
  document.getElementById('step1-tour-dep').textContent = t.departFrom || 'Hà Nội';
  document.getElementById('step1-tour-price').textContent = GTApp.formatVND(t.price);
  if (t.oldPrice) {
    document.getElementById('step1-tour-oldprice').textContent = GTApp.formatVND(t.oldPrice);
  }
  document.getElementById('adult-rate-display').textContent = `${GTApp.formatVND(t.price)}/khách`;

  document.getElementById('booking-adults').textContent = adultsCount;
  document.getElementById('booking-children').textContent = childrenCount;

  // Dates Grid
  const departures = getDepartures(t);
  if (!selectedDate && departures.length > 0) {
    selectedDate = departures[0].date;
    selectedReturnDate = departures[0].returnDate;
  }

  const grid = document.getElementById('step1-dates-grid');
  grid.innerHTML = departures.map(d => {
    const isSel = d.date === selectedDate;
    return `
      <div class="col-12 col-md-4">
        <div class="date-option ${isSel ? 'selected' : ''}" onclick="selectBookingDate(this, '${d.date}', '${d.returnDate}')">
          <div>
            <strong class="d-block small text-navy">${GTApp.formatDateVN(d.date)}</strong>
            <small class="text-muted">Về: ${GTApp.formatDateVN(d.returnDate)}</small>
          </div>
          <span class="badge ${d.seatsLeft > 5 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill">
            ${d.seatsLeft} chỗ
          </span>
        </div>
      </div>
    `;
  }).join('');

  // Prefill user details if logged in
  const currentUser = GTStore.getCurrentUser();
  if (currentUser) {
    document.getElementById('cust-name').value = currentUser.name || '';
    document.getElementById('cust-email').value = currentUser.email || '';
    document.getElementById('cust-phone').value = currentUser.phone || '';
  }

  renderPassengerInputs();
  recalcSummary();
}

function selectBookingDate(el, d, r) {
  document.querySelectorAll('#step1-dates-grid .date-option').forEach(x => x.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = d;
  selectedReturnDate = r;
  recalcSummary();
}

function changeGuest(type, delta) {
  if (type === 'adults') {
    adultsCount = Math.max(1, adultsCount + delta);
    document.getElementById('booking-adults').textContent = adultsCount;
  } else {
    childrenCount = Math.max(0, childrenCount + delta);
    document.getElementById('booking-children').textContent = childrenCount;
  }
  renderPassengerInputs();
  recalcSummary();
}

function renderPassengerInputs() {
  const container = document.getElementById('passenger-inputs-zone');
  const total = adultsCount + childrenCount;
  document.getElementById('passenger-count-badge').textContent = total;

  let html = '';
  for (let i = 1; i <= adultsCount; i++) {
    html += `
      <div class="p-2 border rounded-3 bg-white d-flex align-items-center gap-2">
        <span class="badge bg-primary-subtle text-primary">Người lớn ${i}</span>
        <input type="text" class="form-control form-control-sm passenger-name" placeholder="Họ và tên hành khách ${i}" value="${i === 1 ? (document.getElementById('cust-name')?.value || '') : ''}">
        <select class="form-select form-select-sm passenger-gender" style="width:110px;">
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </div>
    `;
  }
  for (let j = 1; j <= childrenCount; j++) {
    html += `
      <div class="p-2 border rounded-3 bg-white d-flex align-items-center gap-2">
        <span class="badge bg-warning-subtle text-warning">Trẻ em ${j}</span>
        <input type="text" class="form-control form-control-sm passenger-name" placeholder="Họ và tên bé ${j}">
        <input type="number" class="form-control form-control-sm" placeholder="Tuổi (5-11)" min="5" max="11" style="width:110px;">
      </div>
    `;
  }
  container.innerHTML = html;
}

function recalcSummary() {
  const t = bookingTour;
  if (!t) return;

  document.getElementById('sidebar-dep-date').textContent = selectedDate ? GTApp.formatDateVN(selectedDate) : 'Chưa chọn';

  const adultTotal = adultsCount * t.price;
  const childTotal = childrenCount * (t.price * 0.5);
  const units = adultsCount + (childrenCount * 0.5);

  const oldSubtotal = Math.round(units * (t.oldPrice || t.price));
  const currentSubtotal = adultTotal + childTotal;
  const tourDiscount = oldSubtotal - currentSubtotal;

  document.getElementById('sidebar-adult-line').textContent = `${adultsCount} x ${GTApp.formatVND(t.price)} = ${GTApp.formatVND(adultTotal)}`;
  if (childrenCount > 0) {
    document.getElementById('sidebar-child-row').style.display = 'flex';
    document.getElementById('sidebar-child-line').textContent = `${childrenCount} x ${GTApp.formatVND(t.price * 0.5)} = ${GTApp.formatVND(childTotal)}`;
  } else {
    document.getElementById('sidebar-child-row').style.display = 'none';
  }

  document.getElementById('sidebar-subtotal').textContent = GTApp.formatVND(oldSubtotal);
  document.getElementById('sidebar-tour-discount').textContent = `-${GTApp.formatVND(tourDiscount)}`;

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscountAmount = Math.min(appliedCoupon.max, Math.round(currentSubtotal * (appliedCoupon.value / 100)));
    } else {
      couponDiscountAmount = Math.min(currentSubtotal, appliedCoupon.value);
    }
    document.getElementById('coupon-discount-row').style.display = 'flex';
    document.getElementById('applied-coupon-code').textContent = appliedCoupon.code;
    document.getElementById('sidebar-coupon-discount').textContent = `-${GTApp.formatVND(couponDiscountAmount)}`;
  } else {
    document.getElementById('coupon-discount-row').style.display = 'none';
  }

  const finalTotal = Math.max(0, currentSubtotal - couponDiscountAmount);
  document.getElementById('sidebar-total').textContent = GTApp.formatVND(finalTotal);
}

function applyCoupon() {
  const inp = document.getElementById('coupon-input');
  const code = inp.value.trim().toUpperCase();
  const feedback = document.getElementById('coupon-feedback');
  if (!code) {
    feedback.innerHTML = '<span class="text-danger">Vui lòng nhập mã giảm giá</span>';
    return;
  }
  const c = GTStore.findCoupon(code);
  if (!c) {
    feedback.innerHTML = '<span class="text-danger">Mã không hợp lệ hoặc đã hết hạn</span>';
    appliedCoupon = null;
    recalcSummary();
    return;
  }
  appliedCoupon = c;
  feedback.innerHTML = `<span class="text-success"><i class="bi bi-check-circle me-1"></i>Áp dụng mã <strong>${c.code}</strong> thành công! ${c.desc}</span>`;
  GTApp.toast(`Đã áp dụng mã giảm giá: ${c.code}`, 'success');
  recalcSummary();
}

function jumpToStep(step) {
  if (step > currentStep) {
    validateAndGoStep(step);
  } else {
    setStep(step);
  }
}

function validateAndGoStep(targetStep) {
  if (targetStep === 2) {
    if (!selectedDate) {
      GTApp.toast('Vui lòng chọn ngày khởi hành', 'warning');
      return;
    }
    setStep(2);
  } else if (targetStep === 3) {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const email = document.getElementById('cust-email').value.trim();

    if (!name) {
      GTApp.toast('Vui lòng nhập họ và tên người đặt tour', 'warning');
      document.getElementById('cust-name').focus();
      return;
    }
    if (!phone || phone.length < 9) {
      GTApp.toast('Vui lòng nhập số điện thoại hợp lệ (9-11 số)', 'warning');
      document.getElementById('cust-phone').focus();
      return;
    }
    if (!email || !email.includes('@')) {
      GTApp.toast('Vui lòng nhập địa chỉ email hợp lệ', 'warning');
      document.getElementById('cust-email').focus();
      return;
    }

    // Fill review details for Step 3
    populateStep3Review();
    setStep(3);
  }
}

function setStep(step) {
  currentStep = step;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.add('d-none'));
  document.getElementById(`step-panel-${step}`).classList.remove('d-none');

  // Update progress dots & line
  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`step-node-${i}`);
    node.classList.remove('active', 'done');
    if (i < step) node.classList.add('done');
    else if (i === step) node.classList.add('active');
  }

  const progressWidths = { 1: '15%', 2: '45%', 3: '75%', 4: '100%' };
  document.getElementById('step-progress-line').style.width = progressWidths[step];
  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function populateStep3Review() {
  const t = bookingTour;
  document.getElementById('review-tour-name').textContent = t.name;
  document.getElementById('review-tour-dep').textContent = t.departFrom || 'Hà Nội';
  document.getElementById('review-dep-date').textContent = GTApp.formatDateVN(selectedDate);
  document.getElementById('review-ret-date').textContent = GTApp.formatDateVN(selectedReturnDate);
  document.getElementById('review-guests-count').textContent = `${adultsCount} người lớn, ${childrenCount} trẻ em`;
  document.getElementById('review-duration').textContent = `${t.days} ngày ${t.nights} đêm`;

  document.getElementById('review-cust-name').textContent = document.getElementById('cust-name').value;
  document.getElementById('review-cust-phone').textContent = document.getElementById('cust-phone').value;
  document.getElementById('review-cust-email').textContent = document.getElementById('cust-email').value;
  document.getElementById('review-cust-address').textContent = document.getElementById('cust-address').value || 'Chưa cung cấp';
  document.getElementById('review-cust-note').textContent = document.getElementById('cust-note').value || 'Không có yêu cầu đặc biệt';

  // Passenger list review
  const passNames = Array.from(document.querySelectorAll('.passenger-name')).map((inp, idx) => {
    const val = inp.value.trim() || `Hành khách ${idx + 1}`;
    return `<li><i class="bi bi-person me-2 text-primary"></i>${val}</li>`;
  });
  document.getElementById('review-passenger-list').innerHTML = passNames.join('');
}

function createOrderAndProceed() {
  const agreed = document.getElementById('agree-terms').checked;
  if (!agreed) {
    GTApp.toast('Vui lòng đồng ý với điều khoản dịch vụ để tiếp tục', 'warning');
    return;
  }

  const t = bookingTour;
  const units = adultsCount + (childrenCount * 0.5);
  const subtotal = Math.round(units * (t.oldPrice || t.price));
  const currentSubtotal = Math.round(units * t.price);
  const tourDiscount = subtotal - currentSubtotal;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.min(appliedCoupon.max, Math.round(currentSubtotal * (appliedCoupon.value / 100)));
    } else {
      couponDiscount = Math.min(currentSubtotal, appliedCoupon.value);
    }
  }
  const total = Math.max(0, currentSubtotal - couponDiscount);

  // Unique Order Code
  const code = 'GT' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(1000 + Math.random() * 9000);

  const order = {
    code,
    tourId: t.id,
    tourName: t.name,
    image: t.images[0] || FALLBACK_IMG,
    date: selectedDate,
    returnDate: selectedReturnDate,
    adults: adultsCount,
    children: childrenCount,
    customer: {
      name: document.getElementById('cust-name').value.trim(),
      phone: document.getElementById('cust-phone').value.trim(),
      email: document.getElementById('cust-email').value.trim(),
      address: document.getElementById('cust-address').value.trim()
    },
    passengers: Array.from(document.querySelectorAll('.passenger-name')).map(x => x.value.trim()),
    note: document.getElementById('cust-note').value.trim(),
    subtotal,
    discount: tourDiscount,
    couponCode: appliedCoupon ? appliedCoupon.code : null,
    couponDiscount,
    total,
    status: 'pending',
    method: null,
    createdAt: new Date().toISOString(),
    userEmail: document.getElementById('cust-email').value.trim()
  };

  GTStore.saveOrder(order);
  GTApp.toast('Đã lưu thông tin đơn hàng! Chuyển sang thanh toán...', 'success');

  // Navigate to Payment step
  setTimeout(() => {
    window.location.href = `payment.html?code=${code}`;
  }, 500);
}
