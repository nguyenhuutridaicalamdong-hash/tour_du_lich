/* =========================================================
   GoTravel - Mock data (tour, điểm đến, khuyến mãi, người dùng)
   ========================================================= */
const IMG = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const FALLBACK_IMG = IMG('photo-1507525428034-b723cf961d3e', 900);

const PHOTOS = {
  halong: IMG('photo-1528127269322-539801943592'),
  hoian: IMG('photo-1559592413-7cec4d0cae2b'),
  beach1: IMG('photo-1507525428034-b723cf961d3e'),
  beach2: IMG('photo-1519046904884-53103b34b206'),
  beach3: IMG('photo-1506953823976-52e1fdc0149a'),
  mountain1: IMG('photo-1506905925346-21bda4d32df4'),
  mountain2: IMG('photo-1464822759023-fed622ff2c3b'),
  forest: IMG('photo-1441974231531-c6227db76b6e'),
  lake: IMG('photo-1470071459604-3b5ec3a7fe05'),
  flower: IMG('photo-1490750967868-88aa4486c946'),
  temple: IMG('photo-1528181304800-259b08848526'),
  road: IMG('photo-1469854523086-cc02fe5d8800'),
  travel1: IMG('photo-1476514525535-07fb3b4ae5f1'),
  travel2: IMG('photo-1501785888041-af3ef285b470'),
  travel3: IMG('photo-1488646953014-85cb44e25828')
};

const DEFAULT_INCLUDES = [
  'Xe du lịch đời mới đưa đón suốt hành trình',
  'Khách sạn tiêu chuẩn 3–4 sao (2 khách/phòng)',
  'Các bữa ăn theo chương trình',
  'Vé tham quan các điểm trong lịch trình',
  'Hướng dẫn viên nhiệt tình, kinh nghiệm',
  'Bảo hiểm du lịch mức 100.000.000đ/người',
  'Nước uống 1 chai/người/ngày'
];
const DEFAULT_EXCLUDES = [
  'Chi phí cá nhân: giặt ủi, điện thoại, đồ uống ngoài chương trình',
  'Phụ thu phòng đơn',
  'Thuế VAT',
  'Tiền tip cho hướng dẫn viên và tài xế'
];
const DEFAULT_TERMS = [
  'Trẻ em dưới 5 tuổi miễn phí (ngủ chung với bố mẹ), từ 5–11 tuổi tính 50% giá tour.',
  'Hủy tour trước 15 ngày: hoàn 100%. Từ 7–14 ngày: hoàn 70%. Dưới 7 ngày: hoàn 30%.',
  'Quý khách vui lòng mang theo CCCD/Hộ chiếu còn hạn khi tham gia tour.',
  'Thứ tự tham quan có thể thay đổi tùy điều kiện thực tế nhưng đảm bảo đủ điểm.'
];

const DEFAULT_TOURS = [
  {
    id: 1, name: 'Hạ Long – Quảng Ninh', destination: 'Hạ Long', region: 'Miền Bắc', type: 'Biển đảo',
    days: 2, nights: 1, departFrom: 'Hà Nội', price: 2990000, oldPrice: 3520000, badge: 'Bán chạy',
    rating: 4.8, reviews: 324, seats: 30, status: 'active', featured: true, createdAt: '2026-08-01',
    images: [PHOTOS.halong, PHOTOS.lake, PHOTOS.beach2, PHOTOS.travel2, PHOTOS.mountain2],
    overview: 'Vịnh Hạ Long – Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ. Hành trình nghỉ đêm trên du thuyền, chèo kayak khám phá hang động và ngắm hoàng hôn trên vịnh.',
    itinerary: [
      { title: 'Hà Nội – Hạ Long – Du thuyền', desc: 'Khởi hành từ Hà Nội, lên du thuyền tham quan hang Sửng Sốt, đảo Ti Tốp, chèo kayak và ăn tối trên vịnh.' },
      { title: 'Làng chài Cửa Vạn – Hà Nội', desc: 'Tập Thái Cực Quyền đón bình minh, tham quan làng chài, ăn trưa và trở về Hà Nội.' }
    ]
  },
  {
    id: 2, name: 'Đà Nẵng – Hội An – Bà Nà Hills', destination: 'Đà Nẵng', region: 'Miền Trung', type: 'Khám phá',
    days: 4, nights: 3, departFrom: 'TP. Hồ Chí Minh', price: 5590000, oldPrice: 6990000, badge: 'Khuyến mãi',
    rating: 4.9, reviews: 512, seats: 35, status: 'active', featured: true, createdAt: '2026-08-10',
    images: [PHOTOS.hoian, PHOTOS.beach3, PHOTOS.mountain1, PHOTOS.temple, PHOTOS.travel1],
    overview: 'Hành trình kết nối thành phố đáng sống Đà Nẵng, phố cổ Hội An lung linh đèn lồng và Bà Nà Hills với Cầu Vàng nổi tiếng thế giới.',
    itinerary: [
      { title: 'TP.HCM – Đà Nẵng – Bán đảo Sơn Trà', desc: 'Bay ra Đà Nẵng, viếng chùa Linh Ứng, tắm biển Mỹ Khê, ngắm cầu Rồng về đêm.' },
      { title: 'Bà Nà Hills – Cầu Vàng', desc: 'Đi cáp treo kỷ lục, check-in Cầu Vàng, Làng Pháp và khu vui chơi Fantasy Park.' },
      { title: 'Ngũ Hành Sơn – Phố cổ Hội An', desc: 'Tham quan Ngũ Hành Sơn, làng đá Non Nước, dạo phố cổ Hội An và thả đèn hoa đăng.' },
      { title: 'Đà Nẵng – TP.HCM', desc: 'Mua sắm đặc sản tại chợ Hàn, ra sân bay trở về TP.HCM.' }
    ]
  },
  {
    id: 3, name: 'Đà Lạt – Thành phố ngàn hoa', destination: 'Đà Lạt', region: 'Tây Nguyên', type: 'Nghỉ dưỡng',
    days: 3, nights: 2, departFrom: 'TP. Hồ Chí Minh', price: 3490000, oldPrice: 4200000, badge: 'Yêu thích',
    rating: 4.7, reviews: 287, seats: 30, status: 'active', featured: true, createdAt: '2026-08-15',
    images: [PHOTOS.flower, PHOTOS.forest, PHOTOS.lake, PHOTOS.mountain2, PHOTOS.travel2],
    overview: 'Đà Lạt mộng mơ với khí hậu se lạnh quanh năm, rừng thông, đồi chè và những vườn hoa rực rỡ. Thích hợp cho cặp đôi và gia đình.',
    itinerary: [
      { title: 'TP.HCM – Đà Lạt', desc: 'Khởi hành sáng sớm, nhận phòng, dạo hồ Xuân Hương và chợ đêm Đà Lạt.' },
      { title: 'Langbiang – Thung lũng Tình Yêu', desc: 'Chinh phục đỉnh Langbiang bằng xe Jeep, tham quan Thung lũng Tình Yêu, vườn dâu tây.' },
      { title: 'Đồi chè Cầu Đất – TP.HCM', desc: 'Săn mây và check-in đồi chè Cầu Đất, mua đặc sản và trở về TP.HCM.' }
    ]
  },
  {
    id: 4, name: 'Phú Quốc – Thiên đường biển đảo', destination: 'Phú Quốc', region: 'Miền Nam', type: 'Biển đảo',
    days: 4, nights: 3, departFrom: 'TP. Hồ Chí Minh', price: 6990000, oldPrice: 8520000, badge: 'Mới',
    rating: 4.8, reviews: 198, seats: 25, status: 'active', featured: true, createdAt: '2026-09-20',
    images: [PHOTOS.beach2, PHOTOS.beach1, PHOTOS.beach3, PHOTOS.travel3, PHOTOS.lake],
    overview: 'Đảo ngọc Phú Quốc với bãi biển cát trắng, nước trong xanh, cáp treo vượt biển Hòn Thơm và hoàng hôn tuyệt đẹp tại Sunset Town.',
    itinerary: [
      { title: 'TP.HCM – Phú Quốc', desc: 'Bay ra Phú Quốc, nhận phòng resort, tắm biển Bãi Trường, ngắm hoàng hôn.' },
      { title: 'Cano 4 đảo – Lặn ngắm san hô', desc: 'Đi cano khám phá Hòn Móng Tay, Hòn Gầm Ghì, lặn ngắm san hô.' },
      { title: 'Cáp treo Hòn Thơm – Sunset Town', desc: 'Trải nghiệm cáp treo vượt biển dài nhất thế giới, công viên nước Aquatopia.' },
      { title: 'Chợ Dương Đông – TP.HCM', desc: 'Mua sắm đặc sản nước mắm, tiêu, ngọc trai và bay về TP.HCM.' }
    ]
  },
  {
    id: 5, name: 'Sa Pa – Chinh phục Fansipan', destination: 'Sa Pa', region: 'Miền Bắc', type: 'Núi rừng',
    days: 3, nights: 2, departFrom: 'Hà Nội', price: 3290000, oldPrice: 3790000, badge: 'Hot',
    rating: 4.7, reviews: 241, seats: 30, status: 'active', featured: false, createdAt: '2026-07-20',
    images: [PHOTOS.mountain1, PHOTOS.mountain2, PHOTOS.forest, PHOTOS.road, PHOTOS.travel2],
    overview: 'Thị trấn trong sương Sa Pa với ruộng bậc thang, bản làng dân tộc và đỉnh Fansipan – nóc nhà Đông Dương.',
    itinerary: [
      { title: 'Hà Nội – Sa Pa – Bản Cát Cát', desc: 'Di chuyển cao tốc lên Sa Pa, thăm bản Cát Cát và thác Tiên Sa.' },
      { title: 'Đỉnh Fansipan', desc: 'Đi cáp treo chinh phục Fansipan 3.143m, chiêm bái quần thể tâm linh trên đỉnh núi.' },
      { title: 'Núi Hàm Rồng – Hà Nội', desc: 'Tham quan núi Hàm Rồng, chợ Sa Pa và trở về Hà Nội.' }
    ]
  },
  {
    id: 6, name: 'Nha Trang – Biển xanh cát trắng', destination: 'Nha Trang', region: 'Miền Trung', type: 'Biển đảo',
    days: 3, nights: 2, departFrom: 'Hà Nội', price: 3890000, oldPrice: 4590000, badge: 'Khuyến mãi',
    rating: 4.6, reviews: 176, seats: 35, status: 'active', featured: false, createdAt: '2026-09-01',
    images: [PHOTOS.beach3, PHOTOS.beach1, PHOTOS.travel3, PHOTOS.beach2, PHOTOS.lake],
    overview: 'Nha Trang – thành phố biển năng động với vịnh biển đẹp, ẩm thực hải sản phong phú và các hoạt động vui chơi trên đảo.',
    itinerary: [
      { title: 'Hà Nội – Nha Trang', desc: 'Bay vào Nha Trang, tham quan Tháp Bà Ponagar, tắm bùn khoáng nóng.' },
      { title: 'Tour 3 đảo – VinWonders', desc: 'Khám phá Hòn Mun, Hòn Tằm, vui chơi tại VinWonders Nha Trang.' },
      { title: 'Chợ Đầm – Hà Nội', desc: 'Mua sắm đặc sản tại Chợ Đầm và bay về Hà Nội.' }
    ]
  },
  {
    id: 7, name: 'Huế – Cố đô trầm mặc', destination: 'Huế', region: 'Miền Trung', type: 'Văn hóa',
    days: 3, nights: 2, departFrom: 'Hà Nội', price: 3190000, oldPrice: 3590000, badge: 'Yêu thích',
    rating: 4.6, reviews: 143, seats: 30, status: 'active', featured: false, createdAt: '2026-06-12',
    images: [PHOTOS.temple, PHOTOS.hoian, PHOTOS.lake, PHOTOS.forest, PHOTOS.travel1],
    overview: 'Về với cố đô Huế, khám phá Đại Nội, lăng tẩm các vua Nguyễn, nghe ca Huế trên sông Hương thơ mộng.',
    itinerary: [
      { title: 'Hà Nội – Huế – Đại Nội', desc: 'Bay vào Huế, tham quan Đại Nội Kinh Thành, chùa Thiên Mụ.' },
      { title: 'Lăng Khải Định – Ca Huế', desc: 'Viếng lăng Khải Định, lăng Minh Mạng, tối nghe ca Huế trên thuyền rồng.' },
      { title: 'Chợ Đông Ba – Hà Nội', desc: 'Mua sắm tại chợ Đông Ba và trở về Hà Nội.' }
    ]
  },
  {
    id: 8, name: 'Hà Giang – Cung đường hạnh phúc', destination: 'Hà Giang', region: 'Miền Bắc', type: 'Khám phá',
    days: 4, nights: 3, departFrom: 'Hà Nội', price: 4290000, oldPrice: 4990000, badge: 'Mới',
    rating: 4.9, reviews: 98, seats: 20, status: 'active', featured: false, createdAt: '2026-09-25',
    images: [PHOTOS.road, PHOTOS.mountain2, PHOTOS.mountain1, PHOTOS.forest, PHOTOS.travel2],
    overview: 'Hành trình chinh phục cao nguyên đá Đồng Văn, đèo Mã Pì Lèng và dòng Nho Quế xanh ngọc – trải nghiệm dành cho người yêu khám phá.',
    itinerary: [
      { title: 'Hà Nội – Hà Giang', desc: 'Di chuyển lên Hà Giang, check-in cột mốc Km0, dốc Bắc Sum.' },
      { title: 'Quản Bạ – Yên Minh – Đồng Văn', desc: 'Ngắm núi đôi Quản Bạ, rừng thông Yên Minh, dinh thự họ Vương.' },
      { title: 'Mã Pì Lèng – Sông Nho Quế', desc: 'Chinh phục đèo Mã Pì Lèng, đi thuyền trên sông Nho Quế.' },
      { title: 'Hà Giang – Hà Nội', desc: 'Tham quan Lũng Cú và trở về Hà Nội.' }
    ]
  }
];

const DESTINATIONS = [
  { name: 'Hạ Long', count: 12, img: PHOTOS.halong },
  { name: 'Đà Nẵng', count: 18, img: PHOTOS.beach3 },
  { name: 'Phú Quốc', count: 15, img: PHOTOS.beach2 },
  { name: 'Đà Lạt', count: 14, img: PHOTOS.flower },
  { name: 'Sa Pa', count: 9, img: PHOTOS.mountain1 },
  { name: 'Hội An', count: 10, img: PHOTOS.hoian }
];

const DEFAULT_COUPONS = [
  { code: 'GOTRAVEL10', type: 'percent', value: 10, max: 1000000, minOrder: 0, desc: 'Giảm 10% cho mọi tour (tối đa 1 triệu)', active: true },
  { code: 'SUMMER30', type: 'percent', value: 30, max: 2000000, minOrder: 5000000, desc: 'Ưu đãi mùa hè – giảm 30% đơn từ 5 triệu', active: true },
  { code: 'WEEKEND500', type: 'fixed', value: 500000, max: 500000, minOrder: 3000000, desc: 'Deal cuối tuần – giảm 500K đơn từ 3 triệu', active: true }
];

const PROMO_BANNERS = [
  { title: 'GIẢM ĐẾN 30%', sub: 'Cho các tour biển đảo hè này', chip: 'Mã: SUMMER30', img: PHOTOS.beach1, link: 'tours.html?type=Biển đảo' },
  { title: 'ƯU ĐÃI MÙA HÈ', sub: 'Combo gia đình tiết kiệm đến 2 triệu', chip: 'Đến 31/12', img: PHOTOS.beach3, link: 'promotions.html' },
  { title: 'DEAL CUỐI TUẦN', sub: 'Giảm ngay 500K mỗi đơn hàng', chip: 'Mã: WEEKEND500', img: PHOTOS.mountain1, link: 'promotions.html' }
];

const REVIEWS = [
  { name: 'Trần Thu Hà', rating: 5, date: '2026-09-12', text: 'Lịch trình hợp lý, hướng dẫn viên rất nhiệt tình. Khách sạn sạch đẹp, đồ ăn ngon. Sẽ quay lại với GoTravel!' },
  { name: 'Lê Quang Huy', rating: 5, date: '2026-08-28', text: 'Đặt tour nhanh, thanh toán tiện lợi. Cả gia đình mình đều rất hài lòng với chuyến đi.' },
  { name: 'Phạm Ngọc Mai', rating: 4, date: '2026-08-15', text: 'Cảnh đẹp, dịch vụ tốt. Xe hơi chật một chút nhưng tổng thể chuyến đi rất đáng tiền.' }
];

const DEFAULT_USERS = [
  { id: 1, name: 'Nguyễn Minh Anh', email: 'user@gotravel.vn', phone: '0901234567', password: '123456', role: 'user', status: 'active', createdAt: '2026-05-10' },
  { id: 2, name: 'Quản trị viên', email: 'admin@gotravel.vn', phone: '0909999999', password: 'admin123', role: 'admin', status: 'active', createdAt: '2026-01-01' },
  { id: 3, name: 'Trần Thu Hà', email: 'thuha@gmail.com', phone: '0912345678', password: '123456', role: 'user', status: 'active', createdAt: '2026-06-02' },
  { id: 4, name: 'Lê Quang Huy', email: 'quanghuy@gmail.com', phone: '0987654321', password: '123456', role: 'user', status: 'active', createdAt: '2026-07-15' },
  { id: 5, name: 'Phạm Ngọc Mai', email: 'ngocmai@gmail.com', phone: '0938111222', password: '123456', role: 'user', status: 'locked', createdAt: '2026-08-20' }
];

/* Lịch khởi hành được sinh động theo ngày hiện tại để luôn có ngày tương lai */
function getDepartures(tour) {
  const offsets = [5, 12, 19, 33, 47, 61];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return offsets.map((off, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + off + (tour.id % 3));
    const r = new Date(d);
    r.setDate(r.getDate() + tour.days - 1);
    const booked = Math.min(tour.seats, ((tour.id * 7 + i * 5) % (tour.seats + 4)));
    return { date: toISODate(d), returnDate: toISODate(r), seatsLeft: Math.max(0, tour.seats - booked) };
  });
}

function toISODate(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* Đơn hàng mẫu để trang tài khoản và admin có dữ liệu */
function seedOrders() {
  const t = DEFAULT_TOURS;
  const mk = (code, tour, adults, children, status, email, name, phone, daysAgo, method) => {
    const created = new Date(); created.setDate(created.getDate() - daysAgo);
    const dep = new Date(); dep.setDate(dep.getDate() + (status === 'completed' ? -10 : 15));
    const units = adults + children * 0.5;
    const subtotal = Math.round(units * tour.oldPrice);
    const total = Math.round(units * tour.price);
    return {
      code, tourId: tour.id, tourName: tour.name, image: tour.images[0], date: toISODate(dep),
      adults, children, customer: { name, phone, email }, note: '',
      subtotal, discount: subtotal - total, couponCode: null, couponDiscount: 0, total,
      status, method, createdAt: created.toISOString(), userEmail: email
    };
  };
  return [
    mk('GT260915001', t[0], 2, 0, 'completed', 'user@gotravel.vn', 'Nguyễn Minh Anh', '0901234567', 40, 'card'),
    mk('GT260921002', t[2], 2, 1, 'confirmed', 'user@gotravel.vn', 'Nguyễn Minh Anh', '0901234567', 13, 'bank'),
    mk('GT260928003', t[3], 2, 0, 'pending', 'user@gotravel.vn', 'Nguyễn Minh Anh', '0901234567', 6, null),
    mk('GT260902004', t[1], 3, 0, 'paid', 'thuha@gmail.com', 'Trần Thu Hà', '0912345678', 32, 'ewallet'),
    mk('GT260818005', t[4], 2, 0, 'completed', 'quanghuy@gmail.com', 'Lê Quang Huy', '0987654321', 47, 'card'),
    mk('GT260925006', t[5], 4, 2, 'paid', 'quanghuy@gmail.com', 'Lê Quang Huy', '0987654321', 9, 'bank'),
    mk('GT260810007', t[6], 1, 0, 'cancelled', 'ngocmai@gmail.com', 'Phạm Ngọc Mai', '0938111222', 55, null),
    mk('GT261001008', t[7], 2, 0, 'confirmed', 'thuha@gmail.com', 'Trần Thu Hà', '0912345678', 3, 'ewallet')
  ];
}
