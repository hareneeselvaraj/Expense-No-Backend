using ExpenseTracker.Services.Implementations;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PortfolioAnalyticsController : BaseApiController
{
    private readonly PnLCalculationService _pnl;
    private readonly XIRRService _xirr;
    private readonly SnapshotService _snapshot;
    private readonly Data.AppDbContext _db;

    public PortfolioAnalyticsController(PnLCalculationService pnl, XIRRService xirr, SnapshotService snapshot, Data.AppDbContext db)
    {
        _pnl = pnl;
        _xirr = xirr;
        _snapshot = snapshot;
        _db = db;
    }

    [HttpGet("pnl/{investmentId:guid}")]
    public async Task<IActionResult> GetPnL(Guid investmentId)
    {
        var result = await _pnl.CalculatePnLAsync(investmentId);
        return Ok(result);
    }

    [HttpGet("xirr/{investmentId:guid}")]
    public async Task<IActionResult> GetXIRR(Guid investmentId)
    {
        var result = await _xirr.CalculateXIRRAsync(investmentId);
        return Ok(new { xirr = result });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] string scope = "Combined")
    {
        var result = await _pnl.GetPortfolioSummaryAsync(GetUserId(), scope);
        return Ok(result);
    }

    [HttpGet("assets/{category}")]
    public async Task<IActionResult> GetAssets(string category)
    {
        // category = 'MF' or 'Stock' or 'All'
        var result = await _pnl.GetAssetPerformanceAsync(GetUserId(), category);
        return Ok(result);
    }

    [HttpGet("snapshots")]
    public async Task<IActionResult> GetSnapshots()
    {
        var snaps = await _db.PortfolioSnapshots
            .Where(s => s.UserId == GetUserId())
            .OrderBy(s => s.Date)
            .ToListAsync();
        
        return Ok(snaps);
    }

    [HttpPost("snapshots/trigger")]
    public async Task<IActionResult> TriggerSnapshot()
    {
        await _snapshot.TakeSnapshotsAsync();
        return Ok(new { message = "Snapshots updated for all users" });
    }
}
