using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/mfexplore")]
[Authorize]
public class MutualFundExploreController : BaseApiController
{
    private readonly HttpClient _http;
    private readonly ILogger<MutualFundExploreController> _logger;

    public MutualFundExploreController(IHttpClientFactory httpClientFactory, ILogger<MutualFundExploreController> logger)
    {
        _http = httpClientFactory.CreateClient();
        _logger = logger;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("Query parameter 'q' is required");

        try
        {
            var response = await _http.GetAsync($"https://api.mfapi.in/mf/search?q={Uri.EscapeDataString(q)}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching MFAPI for query: {Query}", q);
            return StatusCode(500, new { message = "Failed to fetch data from MFAPI" });
        }
    }

    [HttpGet("scheme/{schemeCode}")]
    public async Task<IActionResult> GetSchemeDetails(string schemeCode)
    {
        if (string.IsNullOrWhiteSpace(schemeCode))
            return BadRequest("Scheme code is required");

        try
        {
            var response = await _http.GetAsync($"https://api.mfapi.in/mf/{schemeCode}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching scheme details from MFAPI for code: {Code}", schemeCode);
            return StatusCode(500, new { message = "Failed to fetch scheme details" });
        }
    }
}
