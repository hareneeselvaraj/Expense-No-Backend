using System.Text;
using System.Text.Json;
using ExpenseTracker.Data;
using ExpenseTracker.DTOs.AIChat;
using ExpenseTracker.Models;
using ExpenseTracker.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services.Implementations;

public class AIChatService : IAIChatService
{
    private readonly AppDbContext        _context;
    private readonly IConfiguration     _config;
    private readonly IHttpClientFactory _httpFactory;
    private readonly ILogger<AIChatService> _logger;
    private readonly ICoupleService         _coupleService;

    public AIChatService(
        AppDbContext context,
        IConfiguration config,
        IHttpClientFactory httpFactory,
        ILogger<AIChatService> logger,
        ICoupleService coupleService)
    {
        _context       = context;
        _config        = config;
        _httpFactory   = httpFactory;
        _logger        = logger;
        _coupleService = coupleService;
    }

    public async Task<AIChatResponseDto> ChatAsync(Guid userId, AIChatRequestDto request)
    {
        var systemPrompt = await BuildSystemPromptAsync(userId);
        var reply        = await CallGroqAsync(systemPrompt, request);
        return new AIChatResponseDto { Reply = reply };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Build a rich system prompt from the user's real financial data
    // ─────────────────────────────────────────────────────────────────────────
    private async Task<string> BuildSystemPromptAsync(Guid userId)
    {
        var now          = DateTime.UtcNow;
        var monthStart   = new DateTime(now.Year, now.Month, 1);
        var threeMonAgo  = now.AddDays(-90);

        var userIds = await _coupleService.GetUserScopeAsync(userId, "Combined");
        var isCouple = userIds.Count > 1;

        // ── Fetch data sequentially (EF DbContext is not thread-safe for WhenAll) ──
        var accounts    = await _context.Accounts
                            .Where(a => userIds.Contains(a.UserId))
                            .ToListAsync();

        var recentTx    = await _context.Transactions
                            .Include(t => t.Category)
                            .Where(t => userIds.Contains(t.UserId) && t.Date >= threeMonAgo)
                            .OrderByDescending(t => t.Date)
                            .Take(150)
                            .ToListAsync();

        var budgets     = await _context.Budgets
                            .Include(b => b.Category)
                            .Where(b => userIds.Contains(b.UserId)
                                     && b.Month == now.Month
                                     && b.Year  == now.Year)
                            .ToListAsync();

        var investments = await _context.Investments
                            .Where(i => userIds.Contains(i.UserId))
                            .ToListAsync();

        var reminders   = await _context.Reminders
                            .Where(r => userIds.Contains(r.UserId) && r.Status == "upcoming")
                            .ToListAsync();

        var sb = new StringBuilder();

        sb.AppendLine("You are a personal financial assistant embedded inside ExpenseTracker, an Indian personal finance app.");
        if (isCouple)
            sb.AppendLine("The user is currently in 'Couple Mode'. The data provided reflects combined household finances of both partners. Please address them inclusively when appropriate (e.g., 'your combined spending').");
        
        sb.AppendLine("All amounts are in Indian Rupees (₹). Use Indian number formatting (lakhs/crores where appropriate).");
        sb.AppendLine("Answer conversationally, be specific with numbers from the data, and give concise actionable advice.");
        sb.AppendLine("If you don't have enough data to answer confidently, say so rather than guessing.");
        sb.AppendLine();
        sb.AppendLine($"Today's date: {now:dd MMMM yyyy}");
        sb.AppendLine();

        // Accounts
        sb.AppendLine("## ACCOUNTS");
        if (accounts.Any())
        {
            foreach (var a in accounts)
                sb.AppendLine($"- {a.Name} ({a.Type}): ₹{a.Balance:N0}");
        }
        else sb.AppendLine("No accounts found.");
        sb.AppendLine();

        // Budgets this month
        sb.AppendLine($"## BUDGETS ({now:MMMM yyyy})");
        if (budgets.Any())
        {
            foreach (var b in budgets)
            {
                // Calculate spent from transactions
                var spent = recentTx
                    .Where(t => t.CategoryId == b.CategoryId
                             && t.Type == TransactionType.Expense
                             && t.Date >= monthStart)
                    .Sum(t => t.Amount);
                var pct = b.Amount > 0 ? (spent / b.Amount * 100) : 0;
                sb.AppendLine($"- {b.Category?.Name}: spent ₹{spent:N0} / ₹{b.Amount:N0} ({pct:F0}%)");
            }
        }
        else sb.AppendLine("No budgets set for this month.");
        sb.AppendLine();

        // Recent transactions (last 90 days) — summarised by month/category
        sb.AppendLine("## RECENT TRANSACTIONS (last 90 days)");
        var txGroups = recentTx
            .GroupBy(t => new { Year = t.Date.Year, Month = t.Date.Month, t.Type })
            .OrderByDescending(g => g.Key.Year).ThenByDescending(g => g.Key.Month);

        foreach (var g in txGroups)
        {
            var label    = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy");
            var total    = g.Sum(t => t.Amount);
            var count    = g.Count();
            var typeStr  = g.Key.Type.ToString();
            sb.AppendLine($"- {label} {typeStr}: ₹{total:N0} across {count} transactions");
        }
        sb.AppendLine();

        // Top spending categories this month
        var thisMonthExpenses = recentTx
            .Where(t => t.Type == TransactionType.Expense && t.Date >= monthStart)
            .GroupBy(t => t.Category?.Name ?? "Unknown")
            .Select(g => new { Category = g.Key, Total = g.Sum(t => t.Amount) })
            .OrderByDescending(x => x.Total)
            .Take(8);

        sb.AppendLine($"## TOP SPENDING THIS MONTH ({now:MMMM yyyy})");
        foreach (var c in thisMonthExpenses)
            sb.AppendLine($"- {c.Category}: ₹{c.Total:N0}");
        sb.AppendLine();

        // Investments
        sb.AppendLine("## INVESTMENTS");
        if (investments.Any())
        {
            var totalInvested = investments.Sum(i => i.InvestedAmount);
            var totalCurrent  = investments.Sum(i => i.CurrentValue);
            var pnl           = totalCurrent - totalInvested;
            sb.AppendLine($"Total invested: ₹{totalInvested:N0} | Current value: ₹{totalCurrent:N0} | P&L: ₹{pnl:N0} ({(totalInvested > 0 ? pnl / totalInvested * 100 : 0):F1}%)");
            foreach (var inv in investments.Take(10))
            {
                var cur    = inv.CurrentValue;
                var ret    = inv.InvestedAmount > 0 ? (cur - inv.InvestedAmount) / inv.InvestedAmount * 100 : 0;
                sb.AppendLine($"- {inv.Name} ({inv.AssetType}): invested ₹{inv.InvestedAmount:N0}, current ₹{cur:N0} ({ret:F1}%)");
            }
        }
        else sb.AppendLine("No investments recorded.");
        sb.AppendLine();

        // Reminders
        sb.AppendLine("## UPCOMING REMINDERS");
        if (reminders.Any())
        {
            foreach (var r in reminders)
            {
                var daysLeft = (r.Date - DateTime.UtcNow).Days;
                sb.AppendLine($"- {r.Title}: ₹{r.Amount?.ToString("N0") ?? "0"} due on {r.Date:dd MMM yyyy} ({daysLeft} days left)");
            }
        }
        else sb.AppendLine("No upcoming reminders.");

        return sb.ToString();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Call the Groq API (OpenAI-compatible chat completions)
    // ─────────────────────────────────────────────────────────────────────────
    private async Task<string> CallGroqAsync(string systemPrompt, AIChatRequestDto request)
    {
        var apiKey = _config["Groq:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return "⚠️ Groq API key is not configured. Please add `Groq:ApiKey` to appsettings.json.";

        // Build messages array (OpenAI format: system, user, assistant)
        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        foreach (var msg in request.History)
        {
            messages.Add(new
            {
                role = msg.Role == "user" ? "user" : "assistant",
                content = msg.Content
            });
        }

        messages.Add(new
        {
            role = "user",
            content = request.Message
        });

        var payload = new
        {
            model = "llama-3.3-70b-versatile",
            messages = messages,
            temperature = 0.7,
            max_tokens = 1024
        };

        var json    = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        try
        {
            var response = await client.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
            var body     = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("[AI CHAT] Groq API error {Status}: {Body}", response.StatusCode, body);
                return "Sorry, I couldn't reach the AI service right now. Please try again later.";
            }

            using var doc  = JsonDocument.Parse(body);
            var textBlock  = doc.RootElement
                               .GetProperty("choices")[0]
                               .GetProperty("message")
                               .GetProperty("content")
                               .GetString();

            return textBlock ?? "No response from AI.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AI CHAT] Exception calling Groq API");
            return "Something went wrong while talking to the AI. Please try again.";
        }
    }
}
