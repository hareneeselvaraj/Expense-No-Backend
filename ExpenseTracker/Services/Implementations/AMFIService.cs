using Microsoft.Extensions.Caching.Memory;

namespace ExpenseTracker.Services.Implementations;

public class AMFIService
{
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AMFIService> _logger;
    private const string CacheKey = "AMFI_NAV_DICT";

    public AMFIService(HttpClient http, IMemoryCache cache, ILogger<AMFIService> logger)
    {
        _http = http;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Returns the NAV for a given scheme code from the cached AMFI dictionary.
    /// Standardized format: SchemeCode => NAV.
    /// </summary>
    public async Task<decimal?> GetNavAsync(string schemeCode)
    {
        var dict = await GetOrFetchNavDictionaryAsync();
        if (dict.TryGetValue(schemeCode, out var nav))
        {
            return nav;
        }
        return null;
    }

    private async Task<Dictionary<string, decimal>> GetOrFetchNavDictionaryAsync()
    {
        if (_cache.TryGetValue(CacheKey, out Dictionary<string, decimal>? cachedDict) && cachedDict != null)
        {
            return cachedDict;
        }

        try
        {
            _logger.LogInformation("[AMFI] Downloading daily NAVAll.txt...");
            var url = "https://www.amfiindia.com/spages/NAVAll.txt";
            var response = await _http.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var text = await response.Content.ReadAsStringAsync();
            var dict = ParseAmfiText(text);

            _logger.LogInformation("[AMFI] Successfully parsed {Count} scheme NAVs.", dict.Count);

            // Cache until the next 8:30 PM IST (when AMFI typically updates)
            var nowUtc = DateTime.UtcNow;
            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var nowIst = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, istZone);
            
            var nextUpdateIst = nowIst.Date.AddHours(20).AddMinutes(30); // 8:30 PM IST today
            if (nowIst >= nextUpdateIst)
            {
                nextUpdateIst = nextUpdateIst.AddDays(1);
            }

            var nextUpdateUtc = TimeZoneInfo.ConvertTimeToUtc(nextUpdateIst, istZone);
            var ttl = nextUpdateUtc - nowUtc;

            _cache.Set(CacheKey, dict, ttl);
            return dict;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AMFI] Failed to fetch and parse AMFI NAV file.");
            return new Dictionary<string, decimal>();
        }
    }

    private static Dictionary<string, decimal> ParseAmfiText(string text)
    {
        var dict = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
        var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var line in lines)
        {
            // Format: Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
            var parts = line.Split(';');
            if (parts.Length >= 5)
            {
                var schemeCode = parts[0].Trim();
                var navStr = parts[4].Trim();

                if (decimal.TryParse(navStr, out var nav))
                {
                    dict[schemeCode] = nav;
                }
            }
        }
        return dict;
    }

    /// <summary>
    /// Fetches historical NAV perfectly backwards until the nearest valid trading date.
    /// Used by Auto-Quantity for Mutual Fund SIPs in InvestmentService.
    /// </summary>
    public async Task<decimal?> GetHistoricalNavAsync(string schemeCode, DateTime targetDate)
    {
        try
        {
            var url = $"https://api.mfapi.in/mf/{schemeCode}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[AMFI] mfapi.in returned {StatusCode} for scheme {SchemeCode}", response.StatusCode, schemeCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            
            if (!doc.RootElement.TryGetProperty("data", out var dataArray)) return null;

            foreach (var item in dataArray.EnumerateArray())
            {
                var dateStr = item.GetProperty("date").GetString();
                if (DateTime.TryParseExact(dateStr, "dd-MM-yyyy", null, System.Globalization.DateTimeStyles.None, out var navDate))
                {
                    if (navDate <= targetDate.Date)
                    {
                        var navStr = item.GetProperty("nav").GetString();
                        if (decimal.TryParse(navStr, out var navVal))
                        {
                            return navVal;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AMFI] Failed to fetch historical NAV for {SchemeCode}", schemeCode);
        }
        return null;
    }
}
