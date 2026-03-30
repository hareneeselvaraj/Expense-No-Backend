using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>Debug: test dashboard without auth.</summary>
    [HttpGet("debug")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDashboardDebug()
    {
        try
        {
            // Get the first user from db to test
            var db = HttpContext.RequestServices.GetRequiredService<ExpenseTracker.Data.AppDbContext>();
            var user = db.Users.FirstOrDefault();
            if (user == null) return Ok(new { message = "No users in DB" });
            var result = await _dashboardService.GetDashboardAsync(user.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            var log = $"[{DateTime.UtcNow}] {ex.GetType().Name}: {ex.Message}\n{ex.StackTrace}\n";
            if (ex.InnerException != null)
                log += $"INNER: {ex.InnerException.GetType().Name}: {ex.InnerException.Message}\n{ex.InnerException.StackTrace}\n";
            await System.IO.File.AppendAllTextAsync("dashboard_error.log", log);
            return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
        }
    }

    /// <summary>Get summary dashboard: totals, monthly breakdown, category breakdown, accounts.</summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboard([FromQuery] int? month = null, [FromQuery] int? year = null, [FromQuery] Guid? accountId = null, [FromQuery] string scope = "Combined")
    {
        try
        {
            var result = await _dashboardService.GetDashboardAsync(GetUserId(), month, year, accountId, scope);
            return Ok(result);
        }
        catch (Exception ex)
        {
            var log = $"[{DateTime.UtcNow}] {ex.GetType().Name}: {ex.Message}\n{ex.StackTrace}\n";
            if (ex.InnerException != null)
                log += $"INNER: {ex.InnerException.GetType().Name}: {ex.InnerException.Message}\n{ex.InnerException.StackTrace}\n";
            await System.IO.File.AppendAllTextAsync("dashboard_error.log", log);
            throw;
        }
    }
}
