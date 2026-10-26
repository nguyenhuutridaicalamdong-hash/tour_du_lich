using System;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Tour> Tours => Set<Tour>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Voucher> Vouchers => Set<Voucher>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Indexes
            modelBuilder.Entity<Order>().HasIndex(o => o.Code).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Voucher>().HasIndex(v => v.Code).IsUnique();

            // Seed Tours
            modelBuilder.Entity<Tour>().HasData(
                new Tour
                {
                    Id = 1,
                    Name = "Hạ Long – Quảng Ninh (Du thuyền 5★)",
                    Destination = "Hạ Long",
                    Region = "Miền Bắc",
                    Type = "Biển đảo",
                    Days = 2,
                    Nights = 1,
                    DepartFrom = "Hà Nội",
                    Price = 2990000,
                    OldPrice = 3520000,
                    Badge = "Bán chạy",
                    Rating = 4.8,
                    ReviewsCount = 324,
                    Seats = 30,
                    Status = "active",
                    Featured = true,
                    ImagesJson = "[\"https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80\"]",
                    Overview = "Vịnh Hạ Long – Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ. Hành trình nghỉ đêm trên du thuyền sang trọng.",
                    CreatedAt = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Tour
                {
                    Id = 2,
                    Name = "Đà Nẵng – Hội An – Bà Nà Hills",
                    Destination = "Đà Nẵng",
                    Region = "Miền Trung",
                    Type = "Khám phá",
                    Days = 3,
                    Nights = 2,
                    DepartFrom = "TP.HCM",
                    Price = 3850000,
                    OldPrice = 4500000,
                    Badge = "Ưu đãi",
                    Rating = 4.9,
                    ReviewsCount = 412,
                    Seats = 25,
                    Status = "active",
                    Featured = true,
                    ImagesJson = "[\"https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80\"]",
                    Overview = "Khám phá Cầu Vàng Bà Nà Hills, phố cổ Hội An rực rỡ đèn lồng và bán đảo Sơn Trà tuyệt đẹp.",
                    CreatedAt = new DateTime(2026, 8, 2, 0, 0, 0, DateTimeKind.Utc)
                },
                new Tour
                {
                    Id = 3,
                    Name = "Phú Quốc – Sunset Sanato – Grand World",
                    Destination = "Phú Quốc",
                    Region = "Miền Nam",
                    Type = "Biển đảo",
                    Days = 4,
                    Nights = 3,
                    DepartFrom = "Hà Nội",
                    Price = 4990000,
                    OldPrice = 5890000,
                    Badge = "Hot",
                    Rating = 4.7,
                    ReviewsCount = 280,
                    Seats = 20,
                    Status = "active",
                    Featured = true,
                    ImagesJson = "[\"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80\"]",
                    Overview = "Đảo ngọc Phú Quốc với làn nước biển trong vắt, hoàng hôn Sunset Sanato và thành phố không ngủ Grand World.",
                    CreatedAt = new DateTime(2026, 8, 3, 0, 0, 0, DateTimeKind.Utc)
                },
                new Tour
                {
                    Id = 4,
                    Name = "Sa Pa – Fansipan – Bản Cát Cát",
                    Destination = "Sa Pa",
                    Region = "Miền Bắc",
                    Type = "Nghỉ dưỡng",
                    Days = 3,
                    Nights = 2,
                    DepartFrom = "Hà Nội",
                    Price = 2790000,
                    OldPrice = 3200000,
                    Badge = "Bán chạy",
                    Rating = 4.9,
                    ReviewsCount = 350,
                    Seats = 30,
                    Status = "active",
                    Featured = true,
                    ImagesJson = "[\"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80\"]",
                    Overview = "Chinh phục nóc nhà Đông Dương Fansipan, săn mây đèo Ô Quy Hồ và trải nghiệm văn hóa bản địa vùng cao.",
                    CreatedAt = new DateTime(2026, 8, 4, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "Nguyễn Văn Hùng",
                    Email = "user@gotravel.vn",
                    PasswordHash = "123456",
                    Phone = "0912345678",
                    Role = "user",
                    Status = "active",
                    CreatedAt = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 2,
                    Name = "Trần Quản Trị",
                    Email = "admin@gotravel.vn",
                    PasswordHash = "admin123",
                    Phone = "0988889999",
                    Role = "admin",
                    Status = "active",
                    CreatedAt = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // Seed Vouchers
            modelBuilder.Entity<Voucher>().HasData(
                new Voucher
                {
                    Id = 1,
                    Code = "HELLOVN",
                    Type = "percent",
                    Value = 10,
                    MaxDiscount = 500000,
                    MinOrder = 2000000,
                    Description = "Giảm 10% tối đa 500.000đ cho đơn từ 2 triệu",
                    IsActive = true
                },
                new Voucher
                {
                    Id = 2,
                    Code = "GOTRAVEL500",
                    Type = "fixed",
                    Value = 500000,
                    MaxDiscount = 500000,
                    MinOrder = 5000000,
                    Description = "Giảm trực tiếp 500.000đ cho đơn từ 5 triệu",
                    IsActive = true
                },
                new Voucher
                {
                    Id = 3,
                    Code = "SUMMER2026",
                    Type = "percent",
                    Value = 15,
                    MaxDiscount = 1000000,
                    MinOrder = 4000000,
                    Description = "Chào hè rực rỡ - Giảm 15% tối đa 1 triệu",
                    IsActive = true
                }
            );
        }
    }
}
