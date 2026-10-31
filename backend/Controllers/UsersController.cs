using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Phone,
                    u.Role,
                    u.Status,
                    u.CreatedAt
                })
                .OrderByDescending(u => u.Id)
                .ToListAsync();

            return Ok(users);
        }

        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Người dùng không tồn tại" });

            if (user.Role == "admin")
            {
                return BadRequest(new { message = "Không thể khóa tài khoản quản trị viên gốc" });
            }

            user.Status = user.Status == "active" ? "locked" : "active";
            await _db.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Status
            });
        }
    }
}
