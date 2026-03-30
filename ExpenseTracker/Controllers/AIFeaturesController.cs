using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.DTOs.AIFeatures;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class AIFeaturesController : BaseApiController
{
    private readonly IAIFeaturesService _aiFeatures;

    public AIFeaturesController(IAIFeaturesService aiFeatures)
    {
        _aiFeatures = aiFeatures;
    }

    // ── Budget Setup ──────────────────────────────────────────────────

    /// <summary>Generate AI budget suggestions from a natural language prompt.</summary>
    [HttpPost("budget/generate")]
    public async Task<IActionResult> GenerateBudget([FromBody] AIBudgetRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Prompt))
            return BadRequest(new { error = "Prompt cannot be empty." });

        var result = await _aiFeatures.GenerateBudgetAsync(GetUserId(), dto);
        return Ok(result);
    }

    /// <summary>Apply AI-generated budget suggestions in bulk.</summary>
    [HttpPost("budget/apply")]
    public async Task<IActionResult> ApplyBudgets([FromBody] AIBudgetApplyDto dto)
    {
        if (dto.Budgets == null || dto.Budgets.Count == 0)
            return BadRequest(new { error = "No budgets to apply." });

        var count = await _aiFeatures.ApplyBudgetsAsync(GetUserId(), dto);
        return Ok(new { applied = count, message = $"{count} budgets created/updated successfully." });
    }

    // ── Fuel Coach ────────────────────────────────────────────────────

    /// <summary>Get personalised AI fuel efficiency tips for all user vehicles.</summary>
    [HttpGet("fuel-coach")]
    public async Task<IActionResult> GetFuelCoach()
    {
        var result = await _aiFeatures.GetFuelCoachAsync(GetUserId());
        return Ok(result);
    }
}
