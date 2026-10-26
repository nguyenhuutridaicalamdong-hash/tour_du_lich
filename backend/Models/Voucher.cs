namespace backend.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Type { get; set; } = "percent"; // percent or fixed
        public decimal Value { get; set; }
        public decimal MaxDiscount { get; set; } = 2000000;
        public decimal MinOrder { get; set; } = 0;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
