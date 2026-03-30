using ExpenseTracker.Data;
using ExpenseTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services.Implementations;

public class ImportService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ImportService> _logger;

    public ImportService(AppDbContext db, ILogger<ImportService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<int> ImportZerodhaTradesAsync(Guid userId, StreamReader reader)
    {
        var line = await reader.ReadLineAsync();
        if (string.IsNullOrEmpty(line)) return 0; // Skip headers

        int count = 0;
        var newTxns = new List<AssetTransaction>();

        while ((line = await reader.ReadLineAsync()) != null)
        {
            var parts = line.Split(',');
            if (parts.Length < 9) continue;

            string symbol = parts[0].Trim('"');
            string isin = parts[1].Trim('"');
            string dateStr = parts[2].Trim('"');
            string type = parts[6].Trim('"').ToUpper() == "buy" ? "BUY" : "SELL";
            
            if (!decimal.TryParse(parts[7].Trim('"'), out var qty)) continue;
            if (!decimal.TryParse(parts[8].Trim('"'), out var price)) continue;
            if (!DateTime.TryParse(dateStr, out var date)) date = DateTime.UtcNow;

            if (qty <= 0) continue;

            var inv = await GetOrCreateInvestmentAsync(userId, symbol, isin, "Stock");

            newTxns.Add(new AssetTransaction
            {
                InvestmentId = inv.Id,
                TxnType = type,
                Date = date,
                Units = qty,
                Price = price,
                Amount = qty * price,
                Notes = "Zerodha Import"
            });
            count++;
        }

        if (newTxns.Any())
        {
            _db.AssetTransactions.AddRange(newTxns);
            await _db.SaveChangesAsync();
        }

        return count;
    }

    private async Task<Investment> GetOrCreateInvestmentAsync(Guid userId, string name, string isin, string type)
    {
        var inv = await _db.Investments.FirstOrDefaultAsync(i => 
            i.UserId == userId && (i.Name == name || (i.ISIN == isin && !string.IsNullOrEmpty(isin))));
            
        if (inv != null) return inv;

        inv = new Investment
        {
            UserId = userId,
            Name = name,
            ISIN = isin,
            AssetType = type,
            Category = Investment.DeriveCategory(type),
            Ticker = type == "Stock" ? $"{name}.NS" : null,
            PriceSource = type == "Stock" ? "yahoo" : "amfi",
            Status = "Active",
            DateInvested = DateTime.UtcNow
        };
        
        _db.Investments.Add(inv);
        await _db.SaveChangesAsync(); // Save immediately to get ID
        return inv;
    }
}
