using ExpenseTracker.Data;
using ExpenseTracker.DTOs.Reminder;
using ExpenseTracker.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ExpenseTracker.Controllers;

[Route("api/reminder")]
[ApiController]
[Authorize]
public class ReminderController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReminderController(AppDbContext context)
    {
        _context = context;
    }

    protected Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null)
            throw new UnauthorizedAccessException("User ID not found in token.");
        return Guid.Parse(claim.Value);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReminderDto>>> GetReminders()
    {
        var userId = GetUserId();

        var reminders = await _context.Reminders
            .Where(r => r.UserId == userId)
            .OrderBy(r => r.Status == "completed") 
            .ThenBy(r => r.Date)
            .Select(r => new ReminderDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Date = r.Date,
                Amount = r.Amount,
                Category = r.Category,
                Priority = r.Priority,
                Status = r.Status
            })
            .ToListAsync();

        return Ok(reminders);
    }

    [HttpPost]
    public async Task<ActionResult<ReminderDto>> CreateReminder(CreateReminderDto createDto)
    {
        var userId = GetUserId();

        var reminder = new Reminder
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = createDto.Title,
            Description = createDto.Description,
            Date = createDto.Date,
            Amount = createDto.Amount,
            Category = createDto.Category,
            Priority = createDto.Priority,
            Status = "upcoming"
        };

        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();

        return Ok(new ReminderDto
        {
            Id = reminder.Id,
            Title = reminder.Title,
            Description = reminder.Description,
            Date = reminder.Date,
            Amount = reminder.Amount,
            Category = reminder.Category,
            Priority = reminder.Priority,
            Status = reminder.Status
        });
    }

    [HttpPut("{id}/complete")]
    public async Task<IActionResult> ToggleComplete(Guid id)
    {
        var userId = GetUserId();
        var reminder = await _context.Reminders.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (reminder == null) return NotFound();

        reminder.Status = reminder.Status == "completed" ? "upcoming" : "completed";
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReminder(Guid id)
    {
        var userId = GetUserId();
        var reminder = await _context.Reminders.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (reminder == null) return NotFound();

        _context.Reminders.Remove(reminder);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
