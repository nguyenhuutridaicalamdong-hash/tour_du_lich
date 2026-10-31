using System;
using System.Collections.Generic;
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
    public class ToursController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ToursController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetTours([FromQuery] string? dest, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice, [FromQuery] string? region)
        {
            var query = _db.Tours.AsQueryable();

            if (!string.IsNullOrWhiteSpace(dest))
            {
                query = query.Where(t => t.Destination.ToLower().Contains(dest.ToLower()) || t.Name.ToLower().Contains(dest.ToLower()));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(t => t.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(t => t.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrWhiteSpace(region) && region != "all")
            {
                query = query.Where(t => t.Region.ToLower() == region.ToLower());
            }

            var tours = await query.OrderByDescending(t => t.Featured).ThenByDescending(t => t.Id).ToListAsync();
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTourById(int id)
        {
            var tour = await _db.Tours.FindAsync(id);
            if (tour == null) return NotFound(new { message = "Tour không tồn tại" });
            return Ok(tour);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTour([FromBody] Tour tour)
        {
            tour.CreatedAt = DateTime.UtcNow;
            if (tour.Images != null && tour.Images.Count > 0 && (string.IsNullOrWhiteSpace(tour.ImagesJson) || tour.ImagesJson == "[]"))
            {
                tour.ImagesJson = System.Text.Json.JsonSerializer.Serialize(tour.Images);
            }
            _db.Tours.Add(tour);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTourById), new { id = tour.Id }, tour);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTour(int id, [FromBody] Tour updated)
        {
            var tour = await _db.Tours.FindAsync(id);
            if (tour == null) return NotFound(new { message = "Tour không tồn tại" });

            tour.Name = updated.Name;
            tour.Destination = updated.Destination;
            tour.Region = updated.Region;
            tour.Type = updated.Type;
            tour.Days = updated.Days;
            tour.Nights = updated.Nights;
            tour.DepartFrom = updated.DepartFrom;
            tour.Price = updated.Price;
            tour.OldPrice = updated.OldPrice;
            tour.Badge = updated.Badge;
            tour.Seats = updated.Seats;
            tour.Status = updated.Status;
            if (updated.Images != null && updated.Images.Count > 0)
            {
                tour.ImagesJson = System.Text.Json.JsonSerializer.Serialize(updated.Images);
            }
            else if (!string.IsNullOrWhiteSpace(updated.ImagesJson))
            {
                tour.ImagesJson = updated.ImagesJson;
            }
            tour.Overview = updated.Overview;

            await _db.SaveChangesAsync();
            return Ok(tour);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var tour = await _db.Tours.FindAsync(id);
            if (tour == null) return NotFound(new { message = "Tour không tồn tại" });

            _db.Tours.Remove(tour);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã xóa tour thành công" });
        }
    }
}
