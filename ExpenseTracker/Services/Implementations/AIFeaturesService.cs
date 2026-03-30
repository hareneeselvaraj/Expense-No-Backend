using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using ExpenseTracker.Data;
using ExpenseTracker.DTOs.AIFeatures;
using ExpenseTracker.DTOs.Budget;
using ExpenseTracker.Models;
using ExpenseTracker.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services.Implementations;

public class AIFeaturesService : IAIFeaturesService
{
    private readonly AppDbContext               _context;
    private readonly IConfiguration            _config;
    private readonly IHttpClientFactory        _httpFactory;
    private readonly IBudgetService            _budgetService;
    private readonly ILogger<AIFeaturesService> _logger;
    private readonly ICoupleService             _coupleService;

    public AIFeaturesService(
        AppDbContext context,
        IConfiguration config,
        IHttpClientFactory httpFactory,
        IBudgetService budgetService,
        ILogger<AIFeaturesService> logger,
        ICoupleService coupleService)
    {
        _context       = context;
        _config        = config;
        _httpFactory   = httpFactory;
        _budgetService = budgetService;
        _logger        = logger;
        _coupleService = coupleService;
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 1 — Natural Language Budget Setup
    // ═══════════════════════════════════════════════════════════════════

    public async Task<AIBudgetResponseDto> GenerateBudgetAsync(Guid userId, AIBudgetRequestDto request)
    {
        var now         = DateTime.UtcNow;
        var threeMonAgo = now.AddDays(-90);

        // Fetch ALL categories first to handle potential type mapping issues with legacy data
        var allCategories = await _context.Categories
            .Where(c => c.UserId == userId)
            .ToListAsync();

        // Filter to Expense only — this handles both "Expense" string and prevents legacy "1" from matching incorrectly
        var excludedIds = request.ExcludedCategoryIds ?? new List<Guid>();
        var categories = allCategories
            .Where(c => !excludedIds.Contains(c.Id))
            .Where(c => c.Type == CategoryType.Expense)
            .ToList();

        var userIds = await _coupleService.GetUserScopeAsync(userId, "Combined");
        var isCouple = userIds.Count > 1;

        if (!categories.Any())
            return new AIBudgetResponseDto
            {
                Summary     = "No categories found. Please create some expense categories first.",
                Suggestions = new()
            };

        // Spending history for Expense and Withdrawal transaction types.
        var recentTx = await _context.Transactions
            .Where(t => userIds.Contains(t.UserId) && t.Date >= threeMonAgo
                     && (t.Type == TransactionType.Expense || t.Type == TransactionType.Withdraw))
            .ToListAsync();

        // Parse income & savings from prompt
        var (income, savePct) = ParseIncomeAndSavings(request.Prompt);
        var spendable = income > 0 ? income * (1 - savePct) : 0;

        // Build numbered list with spending history
        var catData = categories
            .Select((c, idx) => new
            {
                Number     = idx + 1,
                c.Id,
                c.Name,
                AvgMonthly = recentTx
                    .Where(t => t.CategoryId == c.Id)
                    .Sum(t => t.Amount) / 3m
            })
            .ToList();

        _logger.LogInformation("[AI BUDGET] {Count} categories, income=₹{Income}, spendable=₹{Spendable}",
            catData.Count, income, spendable);

        // Try Gemini
        var geminiSuggestions = await TryGeminiAsync(request.Prompt, catData
            .Select(c => (c.Number, c.Name, c.AvgMonthly)).ToList(), spendable, isCouple);

        if (geminiSuggestions != null && geminiSuggestions.Count > 0)
        {
            var mapped = geminiSuggestions
                .Select(g =>
                {
                    var cat = catData.FirstOrDefault(c => c.Number == g.num);
                    return cat == null ? null : new AIBudgetSuggestionDto
                    {
                        CategoryId      = cat.Id,
                        CategoryName    = cat.Name,
                        SuggestedAmount = Math.Max(g.amount, 200),
                        Reasoning       = g.reason
                    };
                })
                .Where(s => s != null)
                .Cast<AIBudgetSuggestionDto>()
                .ToList();

            if (mapped.Count > 0)
            {
                _logger.LogInformation("[AI BUDGET] Gemini succeeded with {N} suggestions", mapped.Count);
                return new AIBudgetResponseDto
                {
                    Summary     = income > 0
                        ? $"AI budget for ₹{income:N0} income with {savePct * 100:0}% savings goal."
                        : "AI-generated budget based on your spending.",
                    Suggestions = mapped
                };
            }
        }

        // Always produce fallback — never show "could not be parsed" to user
        _logger.LogWarning("[AI BUDGET] Gemini failed or empty, building rule-based fallback");
        var fallback = BuildSmartBudget(catData
            .Select(c => (c.Id, c.Name, c.AvgMonthly)).ToList(), income, savePct);

        return new AIBudgetResponseDto
        {
            Summary = income > 0
                ? $"Budget calculated from ₹{income:N0} income — save {savePct * 100:0}% (₹{income * savePct:N0}/month)."
                : "Budget generated from your spending history.",
            Suggestions = fallback
        };
    }

    // ── Smart budget that ALWAYS produces results ──
    private static List<AIBudgetSuggestionDto> BuildSmartBudget(
        List<(Guid Id, string Name, decimal AvgMonthly)> categories,
        decimal income,
        decimal savePct)
    {
        var spendable = income > 0 ? income * (1 - savePct) : 0;
        var totalAvg  = categories.Sum(c => c.AvgMonthly);

        // Keyword weights for categories with no spending history
        static decimal GetWeight(string name)
        {
            var n = name.ToLower();
            if (n.Contains("house") || n.Contains("rent"))                              return 20m;
            if (n.Contains("grocer") || n.Contains("food") || n.Contains("outside"))   return 15m;
            if (n.Contains("transport") || n.Contains("petrol") || n.Contains("fuel")
             || n.Contains("vehicle"))                                                   return 10m;
            if (n.Contains("electric") || n.Contains("gas") || n.Contains("water")
             || n.Contains("bill"))                                                      return 5m;
            if (n.Contains("phone") || n.Contains("recharge") || n.Contains("mobile")) return 3m;
            if (n.Contains("entertain") || n.Contains("movie") || n.Contains("tv"))    return 4m;
            if (n.Contains("cloth") || n.Contains("shopping"))                          return 4m;
            if (n.Contains("health") || n.Contains("medical"))                         return 4m;
            if (n.Contains("educ") || n.Contains("school"))                             return 4m;
            if (n.Contains("personal"))                                                  return 3m;
            if (n.Contains("temple") || n.Contains("religion"))                         return 2m;
            if (n.Contains("gift"))                                                      return 2m;
            return 3m; // default
        }

        // Total weight for proportion calculation when no history
        var totalWeight = categories.Sum(c => GetWeight(c.Name));

        return categories.Select(c =>
        {
            decimal suggested;
            string  reason;

            if (c.AvgMonthly > 0 && spendable > 0 && totalAvg > 0)
            {
                // Has real spending history AND we know income — scale to spendable
                var proportion = c.AvgMonthly / totalAvg;
                suggested = RoundToNearest(spendable * proportion, 100);
                reason = $"Avg ₹{c.AvgMonthly:N0}/month, scaled to income goal";
            }
            else if (c.AvgMonthly > 0)
            {
                // Has history but no income specified — use 110% of average
                suggested = RoundToNearest(c.AvgMonthly * 1.1m, 100);
                reason = $"Based on avg ₹{c.AvgMonthly:N0}/month";
            }
            else if (spendable > 0)
            {
                // No history but income known — use keyword weights
                var weight     = GetWeight(c.Name);
                suggested      = RoundToNearest(spendable * (weight / totalWeight), 100);
                reason         = "Estimated from income and savings goal";
            }
            else
            {
                // No history and no income — minimum reasonable amount
                suggested = 500;
                reason    = "Suggested minimum";
            }

            return new AIBudgetSuggestionDto
            {
                CategoryId      = c.Id,
                CategoryName    = c.Name,
                SuggestedAmount = Math.Max(suggested, 200),
                Reasoning       = reason
            };
        }).ToList();
    }

    private static decimal RoundToNearest(decimal value, decimal nearest)
        => Math.Round(value / nearest) * nearest;

    // ── Parse income and savings % from natural language ──
    private static (decimal income, decimal savePct) ParseIncomeAndSavings(string prompt)
    {
        decimal income  = 0;
        decimal savePct = 0.20m;

        // Match Indian number formats: 80000, 80,000, 1,20,000
        var nums = Regex.Matches(prompt.Replace("₹", "").Replace("Rs", ""), @"[\d,]+");
        foreach (Match m in nums)
        {
            var cleaned = m.Value.Replace(",", "");
            if (decimal.TryParse(cleaned, out var v) && v >= 5000 && v <= 10_000_000)
            {
                income = v;
                break;
            }
        }

        var pctMatch = Regex.Match(prompt, @"(\d+)\s*%");
        if (pctMatch.Success && decimal.TryParse(pctMatch.Groups[1].Value, out var pct) && pct < 100)
            savePct = pct / 100m;

        return (income, savePct);
    }

    // ── Gemini attempt — returns null if anything fails ──
    private async Task<List<(int num, decimal amount, string reason)>?> TryGeminiAsync(
        string prompt,
        List<(int Number, string Name, decimal AvgMonthly)> cats,
        decimal spendable,
        bool isCouple)
    {
        try
        {
            var lines = string.Join("\n",
                cats.Select(c => $"{c.Number}. {c.Name} (avg ₹{c.AvgMonthly:N0}/month)"));

            var spendNote = spendable > 0
                ? $"Spendable after savings: ₹{spendable:N0}/month. "
                : "";
            if (isCouple) spendNote += "Note: This is a shared budget for a couple based on combined household finances. ";

            var p = $"User: \"{prompt}\"\n{spendNote}\nCategories:\n{lines}\n\n" +
                    "Return ONLY JSON: {\"b\":[{\"n\":1,\"a\":5000,\"r\":\"reason why\"},{\"n\":2,\"a\":3000,\"r\":\"reason why\"}]}\n" +
                    "Include ALL category numbers. Integer rupee amounts only. Keep each reason under 8 words.";

            var raw = await PostToGeminiAsync(p);
            if (string.IsNullOrWhiteSpace(raw) || raw == "{}") return null;

            _logger.LogInformation("[AI BUDGET] Gemini raw: {R}", raw);

            var json = StripToJson(raw);
            using var doc = JsonDocument.Parse(json);

            JsonElement arr;
            bool found = doc.RootElement.TryGetProperty("b",           out arr)
                      || doc.RootElement.TryGetProperty("budgets",     out arr)
                      || doc.RootElement.TryGetProperty("suggestions", out arr)
                      || doc.RootElement.TryGetProperty("data",        out arr);

            if (!found) return null;

            var result = new List<(int, decimal, string)>();
            foreach (var item in arr.EnumerateArray())
            {
                int num = GetInt(item, "n", "num", "number");
                decimal amount = GetDecimal(item, "a", "amount", "amt");
                string reason  = GetString(item, "r", "reason", "reasoning") ?? "";

                if (num > 0 && amount > 0)
                    result.Add((num, amount, reason));
            }

            return result.Count > 0 ? result : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[AI BUDGET] Gemini attempt failed");
            return null;
        }
    }

    public async Task<int> ApplyBudgetsAsync(Guid userId, AIBudgetApplyDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            int applied = 0;
            foreach (var s in dto.Budgets)
            {
                var existing = await _context.Budgets
                    .FirstOrDefaultAsync(b => b.UserId     == userId
                                           && b.CategoryId == s.CategoryId
                                           && b.Month      == dto.Month
                                           && b.Year       == dto.Year);
                if (existing != null)
                {
                    existing.Amount = s.SuggestedAmount;
                    _context.Budgets.Update(existing);
                }
                else
                {
                    await _budgetService.CreateAsync(userId, new CreateBudgetDto
                    {
                        CategoryId = s.CategoryId,
                        Amount     = s.SuggestedAmount,
                        Month      = dto.Month,
                        Year       = dto.Year
                    });
                }
                applied++;
            }
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return applied;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "[AI BUDGET APPLY] Bulk save failed for user {UserId}", userId);
            throw new InvalidOperationException("Failed to apply budgets in bulk. Please try again.", ex);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 2 — Fuel Efficiency AI Coach
    // ═══════════════════════════════════════════════════════════════════

    public async Task<FuelCoachResponseDto> GetFuelCoachAsync(Guid userId)
    {
        var vehicles = await _context.Vehicles
            .Where(v => v.UserId == userId).ToListAsync();

        if (!vehicles.Any())
            return new FuelCoachResponseDto
            {
                OverallSummary = "No vehicles found. Add a vehicle to get fuel efficiency tips.",
                Vehicles       = new()
            };

        var allEntries = await _context.FuelEntries
            .Where(f => f.UserId == userId).OrderBy(f => f.Date).ToListAsync();

        var ctx = new StringBuilder();
        foreach (var v in vehicles)
        {
            var ve = allEntries.Where(e => e.VehicleId == v.Id).OrderBy(e => e.Date).ToList();
            ctx.AppendLine($"Vehicle: {v.Name} ({v.VehicleType}, {v.FuelType})");
            if (ve.Count < 2) { ctx.AppendLine("  Insufficient data"); ctx.AppendLine(); continue; }
            decimal dist    = ve.Last().OdometerReading - ve.First().OdometerReading;
            decimal fuel    = ve.Skip(1).Sum(e => e.FuelQuantity);
            decimal cost    = ve.Skip(1).Sum(e => e.FuelCost);
            decimal mileage = fuel > 0 ? dist / fuel : 0;
            ctx.AppendLine($"  Avg mileage: {mileage:F1} km/L | Total cost: ₹{cost:N0} | Distance: {dist:N0} km");
            ctx.AppendLine();
        }

        var p = $"Fuel data:\n{ctx}\nReturn ONLY JSON:\n" +
                "{\"overallSummary\":\"one sentence\",\"vehicles\":[{\"vehicleName\":\"name\",\"statusEmoji\":\"✅\",\"tips\":[\"tip1\",\"tip2\",\"tip3\"]}]}";

        var raw = await PostToGeminiAsync(p);
        try
        {
            using var doc = JsonDocument.Parse(StripToJson(raw));
            var summary = GetString(doc.RootElement, "overallSummary") ?? "";
            var list    = new List<VehicleCoachDto>();
            if (doc.RootElement.TryGetProperty("vehicles", out var vArr))
            {
                foreach (var item in vArr.EnumerateArray())
                {
                    var name  = GetString(item, "vehicleName") ?? "";
                    var emoji = GetString(item, "statusEmoji") ?? "✅";
                    var tips  = new List<string>();
                    if (item.TryGetProperty("tips", out var tArr))
                        foreach (var t in tArr.EnumerateArray())
                            if (t.GetString() is string tip) tips.Add(tip);
                    var real = vehicles.FirstOrDefault(v =>
                        v.Name.Contains(name, StringComparison.OrdinalIgnoreCase) ||
                        name.Contains(v.Name, StringComparison.OrdinalIgnoreCase));
                    list.Add(new VehicleCoachDto
                    {
                        VehicleName = name, VehicleType = real?.VehicleType ?? "",
                        FuelType = real?.FuelType ?? "", Tips = tips, StatusEmoji = emoji
                    });
                }
            }
            return new FuelCoachResponseDto { OverallSummary = summary, Vehicles = list };
        }
        catch
        {
            return new FuelCoachResponseDto
            {
                OverallSummary = "Could not generate tips. Please try again.", Vehicles = new()
            };
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════════════════════════════

    private async Task<string> PostToGeminiAsync(string prompt)
    {
        var apiKey = _config["Google:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey)) return "{}";

        var payload = new
        {
            contents         = new[] { new { role = "user", parts = new[] { new { text = prompt } } } },
            generationConfig = new { temperature = 0.2, maxOutputTokens = 2048, responseMimeType = "application/json" }
        };

        try
        {
            var content  = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var url      = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";
            var response = await _httpFactory.CreateClient("google").PostAsync(url, content);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("[AI BUDGET] Gemini API failed with {StatusCode}: {Body}", response.StatusCode, errorBody);
                return "{}";
            }
            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "{}";
        }
        catch (Exception ex)
        { 
            _logger.LogError(ex, "[AI BUDGET] Exception in PostToGeminiAsync");
            return "{}"; 
        }
    }

    private static string StripToJson(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "{}";
        var s = Regex.Replace(raw, @"```json|```", "", RegexOptions.IgnoreCase).Trim();
        if (s.StartsWith("{") || s.StartsWith("[")) return s;
        var start = s.IndexOf('{');
        var end   = s.LastIndexOf('}');
        return start >= 0 && end > start ? s[start..(end + 1)] : "{}";
    }

    private static int GetInt(JsonElement el, params string[] keys)
    {
        foreach (var k in keys)
            if (el.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number)
                return v.GetInt32();
        return 0;
    }

    private static decimal GetDecimal(JsonElement el, params string[] keys)
    {
        foreach (var k in keys)
        {
            if (!el.TryGetProperty(k, out var v)) continue;
            if (v.ValueKind == JsonValueKind.Number) return v.GetDecimal();
            if (v.ValueKind == JsonValueKind.String &&
                decimal.TryParse(v.GetString()?.Replace(",", ""), out var p)) return p;
        }
        return 0;
    }

    private static string? GetString(JsonElement el, params string[] keys)
    {
        foreach (var k in keys)
            if (el.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String)
                return v.GetString();
        return null;
    }
}
