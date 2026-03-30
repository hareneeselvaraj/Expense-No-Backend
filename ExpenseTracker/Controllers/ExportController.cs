using ExpenseTracker.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ExportController : BaseApiController
{
    private readonly AppDbContext _db;

    public ExportController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> FullExport()
    {
        var userId = GetUserId();

        var data = new
        {
            User = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId),
            Accounts = await _db.Accounts.AsNoTracking().Where(a => a.UserId == userId).ToListAsync(),
            Categories = await _db.Categories.AsNoTracking().Where(c => c.UserId == userId).ToListAsync(),
            Transactions = await _db.Transactions.AsNoTracking().Where(t => t.UserId == userId).ToListAsync(),
            Investments = await _db.Investments.AsNoTracking().Where(i => i.UserId == userId).ToListAsync(),
            SIPs = await _db.SIPs.AsNoTracking().Where(s => s.UserId == userId).ToListAsync(),
            Snapshots = await _db.PortfolioSnapshots.AsNoTracking().Where(s => s.UserId == userId).ToListAsync(),
            ExportedAt = DateTime.UtcNow
        };

        return Ok(data);
    }
}
