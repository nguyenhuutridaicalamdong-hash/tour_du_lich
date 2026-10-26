using System;

namespace backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string DepartureDate { get; set; } = string.Empty;
        public string ReturnDate { get; set; } = string.Empty;
        public int Adults { get; set; } = 1;
        public int Children { get; set; } = 0;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string? CustomerAddress { get; set; }
        public string? PassengersJson { get; set; }
        public string? Note { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public string? CouponCode { get; set; }
        public decimal CouponDiscount { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = "pending"; // pending, paid, confirmed, completed, cancelled
        public string? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
        public string? VnPayTransactionNo { get; set; }
        public string? VnPayBankCode { get; set; }
    }
}
