using ExpenseTracker.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class SIPController : BaseApiController
{
    private readonly SIPService _sipService;

    public SIPController(SIPService sipService)
    {
        _sipService = sipService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSIPDto dto)
    {
        var sip = await _sipService.CreateAsync(GetUserId(), dto);
        return Ok(sip);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sips = await _sipService.GetAllAsync(GetUserId());
        return Ok(sips);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSIPDto dto)
    {
        var sip = await _sipService.UpdateAsync(GetUserId(), id, dto);
        return sip == null ? NotFound() : Ok(sip);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _sipService.DeleteAsync(GetUserId(), id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("{id:guid}/history")]
    public async Task<IActionResult> GetHistory(Guid id)
    {
        var history = await _sipService.GetHistoryAsync(GetUserId(), id);
        return Ok(history);
    }

    /// <summary>Manually trigger SIP execution (for testing)</summary>
    [HttpPost("execute")]
    public async Task<IActionResult> Execute()
    {
        var count = await _sipService.ExecuteDueSIPsAsync();
        return Ok(new { executed = count });
    }
}
