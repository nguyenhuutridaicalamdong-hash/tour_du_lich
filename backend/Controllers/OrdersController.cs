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
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderInput input)
        {
            if (!string.IsNullOrWhiteSpace(input.Code))
            {
                var existing = await _db.Orders.FirstOrDefaultAsync(o => o.Code == input.Code);
                if (existing != null)
                {
                    if (!string.IsNullOrEmpty(input.Status)) existing.Status = input.Status;
                    if (!string.IsNullOrEmpty(input.Method ?? input.PaymentMethod)) existing.PaymentMethod = input.Method ?? input.PaymentMethod;
                    if (existing.Status == "paid" && existing.PaidAt == null) existing.PaidAt = DateTime.UtcNow;
                    if (input.Total > 0) existing.Total = input.Total;
                    await _db.SaveChangesAsync();
                    return Ok(existing);
                }
            }

            var code = string.IsNullOrWhiteSpace(input.Code)
                ? "GT" + DateTime.UtcNow.ToString("yyMMdd") + new Random().Next(1000, 9999)
                : input.Code;

            var order = new Order
            {
                Code = code,
                TourId = input.TourId,
                TourName = input.TourName ?? string.Empty,
                Image = input.Image ?? string.Empty,
                DepartureDate = input.Date ?? input.DepartureDate ?? string.Empty,
                ReturnDate = input.ReturnDate ?? string.Empty,
                Adults = input.Adults,
                Children = input.Children,
                CustomerName = input.Customer?.Name ?? input.CustomerName ?? string.Empty,
                CustomerPhone = input.Customer?.Phone ?? input.CustomerPhone ?? string.Empty,
                CustomerEmail = input.Customer?.Email ?? input.CustomerEmail ?? input.UserEmail ?? string.Empty,
                CustomerAddress = input.Customer?.Address ?? input.CustomerAddress ?? string.Empty,
                PassengersJson = input.Passengers != null ? System.Text.Json.JsonSerializer.Serialize(input.Passengers) : (input.PassengersJson ?? "[]"),
                Note = input.Note,
                Subtotal = input.Subtotal,
                Discount = input.Discount,
                CouponCode = input.CouponCode,
                CouponDiscount = input.CouponDiscount,
                Total = input.Total,
                Status = string.IsNullOrWhiteSpace(input.Status) ? "pending" : input.Status,
                PaymentMethod = input.Method ?? input.PaymentMethod,
                CreatedAt = DateTime.UtcNow
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrderByCode), new { code = order.Code }, order);
        }

        public class CreateOrderInput
        {
            public string? Code { get; set; }
            public int TourId { get; set; }
            public string? TourName { get; set; }
            public string? Image { get; set; }
            public string? Date { get; set; }
            public string? DepartureDate { get; set; }
            public string? ReturnDate { get; set; }
            public int Adults { get; set; } = 1;
            public int Children { get; set; } = 0;
            public CustomerInput? Customer { get; set; }
            public string? CustomerName { get; set; }
            public string? CustomerPhone { get; set; }
            public string? CustomerEmail { get; set; }
            public string? CustomerAddress { get; set; }
            public string? UserEmail { get; set; }
            public List<string>? Passengers { get; set; }
            public string? PassengersJson { get; set; }
            public string? Note { get; set; }
            public decimal Subtotal { get; set; }
            public decimal Discount { get; set; }
            public string? CouponCode { get; set; }
            public decimal CouponDiscount { get; set; }
            public decimal Total { get; set; }
            public string? Status { get; set; }
            public string? Method { get; set; }
            public string? PaymentMethod { get; set; }
        }

        public class CustomerInput
        {
            public string? Name { get; set; }
            public string? Phone { get; set; }
            public string? Email { get; set; }
            public string? Address { get; set; }
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
