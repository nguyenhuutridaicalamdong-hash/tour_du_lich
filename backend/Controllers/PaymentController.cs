using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly VnPayService _vnPayService;

        public PaymentController(AppDbContext db, VnPayService vnPayService)
        {
            _db = db;
            _vnPayService = vnPayService;
        }

        /// <summary>
        /// Tạo URL thanh toán VNPay Sandbox cho đơn hàng
        /// </summary>
        [HttpGet("vnpay-url")]
        public IActionResult CreateVnPayUrl([FromQuery] string orderCode, [FromQuery] decimal amount, [FromQuery] string orderInfo)
        {
            if (string.IsNullOrEmpty(orderCode) || amount <= 0)
            {
                return BadRequest(new { message = "Mã đơn hàng và số tiền không hợp lệ" });
            }

            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var paymentUrl = _vnPayService.CreatePaymentUrl(orderCode, amount, orderInfo ?? $"Thanh toan don hang {orderCode}", clientIp);

            return Ok(new
            {
                orderCode,
                amount,
                paymentUrl
            });
        }

        /// <summary>
        /// Điểm nhận phản hồi kết quả từ cổng VNPay (vnp_ReturnUrl)
        /// </summary>
        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VnPayReturn()
        {
            var isValidSignature = _vnPayService.ValidateSignature(
                Request.Query,
                out var orderCode,
                out var responseCode,
                out var transactionNo,
                out var bankCode
            );

            if (!isValidSignature)
            {
                return BadRequest("Chữ ký bảo mật không hợp lệ (Invalid VNPay Signature)");
            }

            var isSuccess = responseCode == "00";

            // Tìm đơn hàng trong CSDL và cập nhật trạng thái
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Code == orderCode);
            if (order != null)
            {
                if (isSuccess)
                {
                    order.Status = "paid";
                    order.PaymentMethod = "VNPay";
                    order.PaidAt = DateTime.UtcNow;
                    order.VnPayTransactionNo = transactionNo;
                    order.VnPayBankCode = bankCode;
                }
                await _db.SaveChangesAsync();
            }

            // Chuyển hướng người dùng về trang thông báo của Frontend
            var frontendUrl = isSuccess
                ? $"http://localhost:8080/payment-success.html?code={orderCode}&gateway=vnpay&transNo={transactionNo}"
                : $"http://localhost:8080/payment.html?code={orderCode}&status=failed&errCode={responseCode}";

            return Redirect(frontendUrl);
        }
    }
}
