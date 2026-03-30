using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.DTOs.Mileage;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class MileageController : BaseApiController
{
    private readonly IMileageService _mileageService;

    public MileageController(IMileageService mileageService)
    {
        _mileageService = mileageService;
    }

    // ───────────────────── Vehicles ─────────────────────

    [HttpPost("vehicles")]
    public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleDto dto)
    {
        var result = await _mileageService.CreateVehicleAsync(GetUserId(), dto);
        return Created($"api/mileage/vehicles/{result.Id}", result);
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles()
    {
        try
        {
            var result = await _mileageService.GetVehiclesAsync(GetUserId());
            return Ok(result);
        }
        catch (Exception ex)
        {
            System.IO.File.AppendAllText("mileage_error.log", $"[{DateTime.UtcNow}] GetVehicles: {ex}\n\n");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("vehicles/{id:guid}")]
    public async Task<IActionResult> UpdateVehicle(Guid id, [FromBody] UpdateVehicleDto dto)
    {
        var result = await _mileageService.UpdateVehicleAsync(GetUserId(), id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("vehicles/{id:guid}")]
    public async Task<IActionResult> DeleteVehicle(Guid id)
    {
        var deleted = await _mileageService.DeleteVehicleAsync(GetUserId(), id);
        return deleted ? NoContent() : NotFound();
    }

    // ───────────────────── Fuel Entries ─────────────────────

    [HttpPost("fuel-entries")]
    public async Task<IActionResult> CreateFuelEntry([FromBody] CreateFuelEntryDto dto)
    {
        var result = await _mileageService.CreateFuelEntryAsync(GetUserId(), dto);
        return Created($"api/mileage/fuel-entries/{result.Id}", result);
    }

    [HttpGet("fuel-entries")]
    public async Task<IActionResult> GetFuelEntries([FromQuery] Guid? vehicleId)
    {
        try
        {
            var result = await _mileageService.GetFuelEntriesAsync(GetUserId(), vehicleId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            System.IO.File.AppendAllText("mileage_error.log", $"[{DateTime.UtcNow}] GetFuelEntries: {ex}\n\n");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("fuel-entries/{id:guid}")]
    public async Task<IActionResult> UpdateFuelEntry(Guid id, [FromBody] UpdateFuelEntryDto dto)
    {
        var result = await _mileageService.UpdateFuelEntryAsync(GetUserId(), id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("fuel-entries/{id:guid}")]
    public async Task<IActionResult> DeleteFuelEntry(Guid id)
    {
        var deleted = await _mileageService.DeleteFuelEntryAsync(GetUserId(), id);
        return deleted ? NoContent() : NotFound();
    }

    // ───────────────────── Summary ─────────────────────

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        try
        {
            var result = await _mileageService.GetMileageSummaryAsync(GetUserId());
            return Ok(result);
        }
        catch (Exception ex)
        {
            System.IO.File.AppendAllText("mileage_error.log", $"[{DateTime.UtcNow}] GetSummary: {ex}\n\n");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
