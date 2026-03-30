using System.Text.Json;
using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Services.Implementations;

public class PriceFeedService : IPriceFeedService
{
    private readonly HttpClient _http;
    private readonly IServiceProvider _sp;
    private readonly AMFIService _amfi;
    private readonly ILogger<PriceFeedService> _logger;

    public PriceFeedService(HttpClient http, IServiceProvider sp, AMFIService amfi, ILogger<PriceFeedService> logger)
    {
        _http = http;
        _sp = sp;
        _amfi = amfi;
        _logger = logger;
    }

    // ─── USD/INR ────────────────────────────────────────────────────────

    private async Task<decimal> GetUsdInrRateAsync()
    {
        var result = await GetCachedOrFetch("INR=X", "yahoo", async () => await FetchYahooPriceAsync("INR=X"), GetStockCacheDuration());
        return result.Price > 0 ? result.Price : 83.0m; // safe fallback
    }

    // ─── Stocks & ETFs (Yahoo Finance) ───────────────────────────────────

    public async Task<PriceResult> GetStockPriceAsync(string ticker)
    {
        // Is it a US stock? (Usually just letters, no suffix like .NS)
        bool isUsStock = !ticker.Contains('.') && !ticker.Contains('=') && !ticker.Contains('-');

        var result = await GetCachedOrFetch(ticker, "yahoo", async () => await FetchYahooPriceAsync(ticker), GetStockCacheDuration());

        if (isUsStock && result.Price > 0)
        {
            var rate = await GetUsdInrRateAsync();
            result.Price = Math.Round(result.Price * rate, 2);
        }

        return result;
    }

    private async Task<decimal> FetchYahooPriceAsync(string ticker)
    {
        var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{Uri.EscapeDataString(ticker)}?interval=1d&range=1d";
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");

        var response = await _http.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            // fallback URL
            url = $"https://query2.finance.yahoo.com/v8/finance/chart/{Uri.EscapeDataString(ticker)}?interval=1d&range=1d";
            response = await _http.GetAsync(url);
            response.EnsureSuccessStatusCode();
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        var resultObj = doc.RootElement.GetProperty("chart").GetProperty("result")[0];
        var meta = resultObj.GetProperty("meta");
        return meta.GetProperty("regularMarketPrice").GetDecimal();
    }

    // ─── Mutual Funds (AMFIService) ──────────────────────────────────────

    public async Task<PriceResult> GetMutualFundNavAsync(string schemeCode)
    {
        return await GetCachedOrFetch($"mf:{schemeCode}", "amfi", async () =>
        {
            var nav = await _amfi.GetNavAsync(schemeCode);
            return nav ?? 0m;
        }, TimeSpan.FromHours(6)); // MFs don't trade intra-day, 6 hrs is fine
    }

    // ─── Crypto (Yahoo Finance) ─────────────────────────────────────────

    public async Task<PriceResult> GetCryptoPriceAsync(string symbol)
    {
        var ticker = symbol.ToUpperInvariant().EndsWith("-USD")
            ? symbol
            : $"{symbol.ToUpperInvariant()}-USD";

        var result = await GetCachedOrFetch(ticker, "yahoo", async () => await FetchYahooPriceAsync(ticker), TimeSpan.FromMinutes(2));

        if (result.Price > 0)
        {
            var rate = await GetUsdInrRateAsync();
            result.Price = Math.Round(result.Price * rate, 2);
        }

        return result;
    }

    // ─── Auto-Router ────────────────────────────────────────────────────

    public async Task<PriceResult> GetPriceAsync(string ticker, string priceSource)
    {
        return priceSource.ToLowerInvariant() switch
        {
            "yahoo" => await GetStockPriceAsync(ticker),
            "mfapi" or "amfi" => await GetMutualFundNavAsync(ticker),
            "crypto" => await GetCryptoPriceAsync(ticker),
            _ => new PriceResult
            {
                Ticker = ticker,
                Source = "manual",
                Error = "Unknown price source",
                FetchedAt = DateTime.UtcNow
            }
        };
    }

    public async Task<List<PriceResult>> GetPricesBatchAsync(IEnumerable<(string ticker, string source)> requests)
    {
        var tasks = requests.Select(r => GetPriceAsync(r.ticker, r.source));
        var results = await Task.WhenAll(tasks);
        return results.ToList();
    }

    public void ClearCache()
    {
        using var scope = _sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.PriceCaches.RemoveRange(db.PriceCaches);
        db.SaveChanges();
        _logger.LogInformation("[PriceFeed] DB Price Cache cleared.");
    }

    // ─── Smart Cache logic ──────────────────────────────────────────────

    private static TimeSpan GetStockCacheDuration()
    {
        var ist = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        var nowOst = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ist);
        
        bool isMarketHours = nowOst.TimeOfDay >= new TimeSpan(9, 15, 0) && nowOst.TimeOfDay <= new TimeSpan(15, 30, 0);
        bool isWeekend = nowOst.DayOfWeek == DayOfWeek.Saturday || nowOst.DayOfWeek == DayOfWeek.Sunday;

        if (!isWeekend && isMarketHours)
        {
            return TimeSpan.FromMinutes(5); // Fast refresh during market
        }
        return TimeSpan.FromHours(6); // Slow refresh outside market
    }

    private async Task<PriceResult> GetCachedOrFetch(string ticker, string source, Func<Task<decimal>> fetcher, TimeSpan ttl)
    {
        using var scope = _sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cached = await db.PriceCaches.FindAsync(ticker);
        var isStale = cached != null && (DateTime.UtcNow - cached.FetchedAt) > ttl;

        if (cached != null && !isStale)
        {
            return new PriceResult
            {
                Ticker = ticker,
                Price = cached.Price,
                Source = cached.Source,
                IsLive = false,
                FetchedAt = cached.FetchedAt
            };
        }

        try
        {
            var newPrice = await fetcher();
            if (newPrice == 0m) throw new Exception("Fetched price is 0.");

            if (cached == null)
            {
                cached = new PriceCache
                {
                    Ticker = ticker,
                    Source = source,
                    Price = newPrice,
                    Currency = "INR",
                    FetchedAt = DateTime.UtcNow
                };
                db.PriceCaches.Add(cached);
            }
            else
            {
                cached.Price = newPrice;
                cached.FetchedAt = DateTime.UtcNow;
                db.PriceCaches.Update(cached);
            }
            await db.SaveChangesAsync();

            return new PriceResult
            {
                Ticker = ticker,
                Price = newPrice,
                Source = source,
                IsLive = true,
                FetchedAt = cached.FetchedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[PriceFeed] Failed to fetch price for {Ticker}. Using stale cache if available.", ticker);

            if (cached != null)
            {
                return new PriceResult
                {
                    Ticker = ticker,
                    Price = cached.Price,
                    Source = cached.Source,
                    IsLive = false, // Even though returning, it marks stale essentially
                    FetchedAt = cached.FetchedAt,
                    Error = "Using stale cache. " + ex.Message
                };
            }

            return new PriceResult
            {
                Ticker = ticker,
                Source = source,
                Error = ex.Message,
                FetchedAt = DateTime.UtcNow
            };
        }
    }
}
