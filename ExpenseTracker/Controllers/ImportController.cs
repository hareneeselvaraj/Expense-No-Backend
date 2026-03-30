using ExpenseTracker.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ImportController : BaseApiController
{
    private readonly ImportService _importService;

    public ImportController(ImportService importService)
    {
        _importService = importService;
    }

    [HttpPost("zerodha")]
    public async Task<IActionResult> ImportZerodha(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty");

        try
        {
            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            var count = await _importService.ImportZerodhaTradesAsync(GetUserId(), reader);
            
            return Ok(new { message = $"Successfully imported {count} transactions from Zerodha." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to import file.", error = ex.Message });
        }
    }
}
