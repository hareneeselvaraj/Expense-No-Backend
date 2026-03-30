using ExpenseTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ExpenseTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CoupleController : ControllerBase
{
    private readonly ICoupleService _coupleService;
    private readonly ILogger<CoupleController> _logger;

    public CoupleController(ICoupleService coupleService, ILogger<CoupleController> logger)
    {
        _coupleService = coupleService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(idClaim!);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateCouple([FromBody] CreateCoupleRequest request)
    {
        try
        {
            var inviteCode = await _coupleService.CreateCoupleAsync(GetUserId(), request.InviteEmail);
            return Ok(new { inviteCode });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating couple invite");
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again." });
        }
    }

    [HttpPost("accept")]
    public async Task<IActionResult> AcceptInvite([FromBody] AcceptInviteRequest request)
    {
        var success = await _coupleService.AcceptInviteAsync(request.InviteCode, GetUserId());
        if (!success) return BadRequest(new { message = "Invalid or expired invite code." });
        return Ok(new { message = "Invite accepted successfully." });
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var status = await _coupleService.GetCoupleStatusAsync(GetUserId());
        return Ok(status ?? new { status = "None" });
    }

    [HttpDelete("leave")]
    public async Task<IActionResult> LeaveCouple()
    {
        // Always return success — clean up even if there's nothing to clean
        await _coupleService.LeaveCoupleAsync(GetUserId());
        return Ok(new { message = "Successfully left the couple." });
    }
}

public class CreateCoupleRequest
{
    public string InviteEmail { get; set; } = string.Empty;
}

public class AcceptInviteRequest
{
    public string InviteCode { get; set; } = string.Empty;
}
