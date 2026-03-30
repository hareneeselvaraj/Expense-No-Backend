namespace ExpenseTracker.Services.Interfaces;

public class PriceResult
{
    public string Ticker { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Source { get; set; } = "unknown";   // "yahoo" | "mfapi" | "manual"
    public bool IsLive { get; set; }                   // true = fresh, false = cached
    public DateTime FetchedAt { get; set; }
    public string? Error { get; set; }
}

public interface IPriceFeedService
{
    /// <summary>Get live price for a stock/ETF via Yahoo Finance (e.g. "TCS.NS", "GOLDBEES.NS")</summary>
    Task<PriceResult> GetStockPriceAsync(string ticker);

    /// <summary>Get live NAV for a mutual fund via mfapi.in (e.g. "119598")</summary>
    Task<PriceResult> GetMutualFundNavAsync(string schemeCode);

    /// <summary>Get live crypto price via Yahoo Finance (e.g. "BTC" → "BTC-USD")</summary>
    Task<PriceResult> GetCryptoPriceAsync(string symbol);

    /// <summary>Get price for any asset type (auto-routes to the correct provider)</summary>
    Task<PriceResult> GetPriceAsync(string ticker, string priceSource);

    /// <summary>Batch-fetch prices for multiple tickers</summary>
    Task<List<PriceResult>> GetPricesBatchAsync(IEnumerable<(string ticker, string source)> requests);

    /// <summary>Clear all cached prices</summary>
    void ClearCache();
}
