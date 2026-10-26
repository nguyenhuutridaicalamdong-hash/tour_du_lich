using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public OrdersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] string? email, [FromQuery] string? status)
        {
            var query = _db.Orders.AsQueryable();

            if (!string.IsNullOrWhiteSpace(email))
            {
                query = query.Where(o => o.CustomerEmail.ToLower() == email.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "all")
            {
                query = query.Where(o => o.Status.ToLower() == status.ToLower());
            }

            var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(orders);
        }

        [HttpGet("{code}")]
        public async Task<IActionResult> GetOrderByCode(string code)
        {
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Code == code);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });
            return Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            if (string.IsNullOrWhiteSpace(order.Code))
            {
                order.Code = "GT" + DateTime.UtcNow.ToString("yyMMdd") + new Random().Next(1000, 9999);
            }

            order.CreatedAt = DateTime.UtcNow;
            order.Status = "pending";

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrderByCode), new { code = order.Code }, order);
        }

        [HttpPatch("{code}/status")]
        public async Task<IActionResult> UpdateOrderStatus(string code, [FromBody] UpdateStatusDto dto)
        {
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Code == code);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });

            order.Status = dto.Status;
            if (dto.Status == "paid" && !order.PaidAt.HasValue)
            {
                order.PaidAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return Ok(order);
        }

        public class UpdateStatusDto
        {
            public string Status { get; set; } = "pending";
        }
    }
}
