using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower());
            if (user == null || user.PasswordHash != req.Password)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác" });
            }

            if (user.Status == "locked")
            {
                return Forbid("Tài khoản của bạn đã bị tạm khóa, vui lòng liên hệ admin.");
            }

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                phone = user.Phone,
                role = user.Role,
                status = user.Status
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == req.Email.ToLower());
            if (exists)
            {
                return BadRequest(new { message = "Email này đã được đăng ký trên hệ thống" });
            }

            var newUser = new User
            {
                Name = req.Name,
                Email = req.Email,
                PasswordHash = req.Password,
                Phone = req.Phone ?? "",
                Role = "user",
                Status = "active",
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                id = newUser.Id,
                name = newUser.Name,
                email = newUser.Email,
                phone = newUser.Phone,
                role = newUser.Role,
                status = newUser.Status
            });
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string? Phone { get; set; }
        }
    }
}
