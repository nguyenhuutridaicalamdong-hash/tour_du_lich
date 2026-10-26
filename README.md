# GoTravel - Hệ Thống Bán Hàng & Đặt Tour Du Lịch

GoTravel là website bán hàng, đặt tour du lịch và thanh toán trực tuyến hiện đại, trẻ trung, chuyên nghiệp.

## 🚀 Tính năng nổi bật

- **Trang chủ (`index.html`):** Hero banner phong cảnh Việt Nam, Booking search box nổi trên banner, 6 ưu điểm USP pastel, Tour nổi bật, Banner khuyến mãi, Điểm đến thịnh hành.
- **Tìm kiếm & Bộ lọc tour (`tours.html`):** Lọc theo điểm đến, khoảng giá, thời lượng, loại tour, đánh giá sao; sắp xếp theo giá và độ phổ biến.
- **Chi tiết tour (`tour-detail.html`):** Gallery ảnh lớn, thông tin lịch trình chi tiết (timeline), dịch vụ bao gồm & không bao gồm, điều khoản hoàn hủy, đánh giá khách hàng, widget đặt tour cố định tự tính giá.
- **Quy trình đặt tour 4 bước (`booking.html`):** 
  - Bước 1: Xác nhận tour & ngày khởi hành
  - Bước 2: Thông tin người liên hệ & danh sách hành khách, yêu cầu đặc biệt
  - Bước 3: Xem lại và xác nhận đơn hàng, nhập mã voucher
  - Bước 4: Chuyển sang thanh toán
- **Thanh toán đa kênh (`payment.html`):** Hỗ trợ Thẻ ngân hàng (Visa/Master/ATM), Quét mã VietQR 24/7 tự động sinh theo đơn hàng, Ví điện tử (MoMo/ZaloPay/VNPay).
- **Xác nhận thanh toán thành công (`payment-success.html`):** Hóa đơn điện tử tóm tắt chuyến đi, in vé điện tử.
- **Giỏ hàng (`cart.html`):** Quản lý các tour đã chọn, tính tổng chi phí, tiến hành thanh toán.
- **Tài khoản cá nhân (`profile.html`):** Quản lý thông tin, theo dõi đơn hàng với các trạng thái (*Chờ thanh toán, Đã thanh toán, Đã xác nhận, Hoàn thành, Đã hủy*), danh sách tour yêu thích.
- **Khuyến mãi & Vouchers (`promotions.html`):** Danh sách ưu đãi và mã giảm giá có nút sao chép nhanh.
- **Về chúng tôi (`about.html`) & Liên hệ (`contact.html`):** Giới thiệu câu chuyện thương hiệu, đội ngũ sáng lập, hotline 1900 6868, form liên hệ và bản đồ văn phòng.
- **Cổng Quản trị Admin (`admin.html`):** 
  - Thống kê doanh thu, đơn hàng, khách hàng, tour đang bán
  - Biểu đồ cột doanh thu 6 tháng gần nhất
  - Quản lý Tour (CRUD thêm/sửa/xóa tour)
  - Quản lý Đơn hàng (Cập nhật trạng thái trực tiếp)
  - Quản lý Khách hàng (Khóa/Mở tài khoản)
  - Quản lý Khuyến mãi (Tạo mã voucher mới)

## 🛠 Công nghệ sử dụng

- **Frontend:** HTML5, CSS3 module hóa, Bootstrap 5.3, Bootstrap Icons, JavaScript thuần (Vanilla JS).
- **Backend:** ASP.NET Core Web API (.NET 10), Entity Framework Core, **Microsoft SQL Server (`.\SQLEXPRESS`)** - Database `GoTravelDb` (tự động tạo bảng & seed dữ liệu mẫu).
- **Cổng thanh toán:** Tích hợp cổng thanh toán trực tuyến **VNPay Sandbox** (mã hóa bảo mật HMAC-SHA512).

## 💻 Cách chạy dự án

### 1. Khởi chạy Backend ASP.NET Core Web API:
```bash
cd backend
dotnet run --urls="http://localhost:5000"
```
- API Base URL: `http://localhost:5000`
- Cơ sở dữ liệu: Tự động khởi tạo database **`GoTravelDb`** trên Microsoft SQL Server instance `.\SQLEXPRESS` (Windows Authentication).
- Tích hợp VNPay Sandbox: endpoint sinh URL thanh toán `/api/payment/vnpay-url` và nhận phản hồi `/api/payment/vnpay-return`.

### 2. Khởi chạy Frontend:
Mở file `index.html` trực tiếp trên trình duyệt, hoặc chạy qua PowerShell server:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Truy cập: `http://localhost:8080`

### 3. Tài khoản demo:
- **Khách hàng:** `user@gotravel.vn` / Mật khẩu: `123456`
- **Quản trị viên:** `admin@gotravel.vn` / Mật khẩu: `admin123`

