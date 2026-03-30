using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Services.Implementations;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services;

public class SnapshotService
{
    private readonly AppDbContext _db;
    private readonly PnLCalculationService _pnl;

    public SnapshotService(AppDbContext db, PnLCalculationService pnl)
    {
        _db = db;
        _pnl = pnl;
    }

    public async Task TakeSnapshotsAsync()
    {
        var users = await _db.Users.ToListAsync();
        foreach (var u in users)
        {
            var summary = await _pnl.GetPortfolioSummaryAsync(u.Id, "Combined");
            if (summary.TotalInvested == 0) continue; // Don't snapshot empty users
            
            // Delete today's snapshot if exists
            var today = DateTime.UtcNow.Date;
            var existing = await _db.PortfolioSnapshots
                .FirstOrDefaultAsync(s => s.UserId == u.Id && s.Date == today);
            
            if (existing != null)
            {
                existing.TotalInvested = summary.TotalInvested;
                existing.TotalValue = summary.CurrentValue;
                existing.TotalPnl = summary.OverallPnL;
            }
            else
            {
                _db.PortfolioSnapshots.Add(new PortfolioSnapshot
                {
                    UserId = u.Id,
                    Date = today,
                    TotalInvested = summary.TotalInvested,
                    TotalValue = summary.CurrentValue,
                    TotalPnl = summary.OverallPnL
                });
            }
        }
        await _db.SaveChangesAsync();
    }
}
