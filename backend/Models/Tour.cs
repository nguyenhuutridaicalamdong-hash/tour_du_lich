using System;

namespace backend.Models
{
    public class Tour
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public string Region { get; set; } = "Miền Bắc";
        public string Type { get; set; } = "Khám phá";
        public int Days { get; set; } = 3;
        public int Nights { get; set; } = 2;
        public string DepartFrom { get; set; } = "Hà Nội";
        public decimal Price { get; set; }
        public decimal? OldPrice { get; set; }
        public string Badge { get; set; } = "Bán chạy";
        public double Rating { get; set; } = 5.0;
        public int ReviewsCount { get; set; } = 100;
        public int Seats { get; set; } = 30;
        public string Status { get; set; } = "active";
        public bool Featured { get; set; } = true;
        public string ImagesJson { get; set; } = "[]";
        public string Overview { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
