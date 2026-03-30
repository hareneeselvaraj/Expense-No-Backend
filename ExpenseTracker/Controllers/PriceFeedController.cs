using ExpenseTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PriceFeedController : BaseApiController
{
    private readonly IPriceFeedService _priceFeed;

    public PriceFeedController(IPriceFeedService priceFeed)
    {
        _priceFeed = priceFeed;
    }

    /// <summary>Get live price for a single ticker</summary>
    [HttpGet("{ticker}")]
    public async Task<IActionResult> GetPrice(string ticker, [FromQuery] string source = "yahoo")
    {
        var result = await _priceFeed.GetPriceAsync(ticker, source);
        return Ok(result);
    }

    /// <summary>Batch-fetch prices for multiple tickers</summary>
    [HttpPost("batch")]
    public async Task<IActionResult> GetPricesBatch([FromBody] BatchPriceRequest request)
    {
        var tuples = request.Items.Select(i => (i.Ticker, i.Source));
        var results = await _priceFeed.GetPricesBatchAsync(tuples);
        return Ok(results);
    }

    /// <summary>Clear all cached prices</summary>
    [HttpDelete("cache")]
    public IActionResult ClearCache()
    {
        _priceFeed.ClearCache();
        return Ok(new { message = "Price cache cleared" });
    }
}

public class BatchPriceRequest
{
    public List<BatchPriceItem> Items { get; set; } = new();
}

public class BatchPriceItem
{
    public string Ticker { get; set; } = string.Empty;
    public string Source { get; set; } = "yahoo";
}
