using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public VouchersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetVouchers()
        {
            var vouchers = await _db.Vouchers.OrderByDescending(v => v.Id).ToListAsync();
            return Ok(vouchers);
        }

        [HttpGet("{code}")]
        public async Task<IActionResult> GetVoucherByCode(string code)
        {
            var voucher = await _db.Vouchers.FirstOrDefaultAsync(v => v.Code.ToUpper() == code.ToUpper() && v.IsActive);
            if (voucher == null) return NotFound(new { message = "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
            return Ok(voucher);
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] Voucher voucher)
        {
            if (string.IsNullOrWhiteSpace(voucher.Code))
            {
                return BadRequest(new { message = "Mã voucher không được để trống" });
            }

            voucher.Code = voucher.Code.Trim().ToUpper();
            var exists = await _db.Vouchers.AnyAsync(v => v.Code == voucher.Code);
            if (exists)
            {
                return BadRequest(new { message = "Mã giảm giá này đã tồn tại" });
            }

            voucher.IsActive = true;
            _db.Vouchers.Add(voucher);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVoucherByCode), new { code = voucher.Code }, voucher);
        }

        [HttpDelete("{code}")]
        public async Task<IActionResult> DeleteVoucher(string code)
        {
            var voucher = await _db.Vouchers.FirstOrDefaultAsync(v => v.Code.ToUpper() == code.ToUpper());
            if (voucher == null) return NotFound(new { message = "Mã giảm giá không tồn tại" });

            _db.Vouchers.Remove(voucher);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã xóa mã giảm giá thành công" });
        }
    }
}
