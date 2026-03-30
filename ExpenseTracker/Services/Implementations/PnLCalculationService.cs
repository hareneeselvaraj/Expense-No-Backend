using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services.Implementations;

public class PnLCalculationService
{
    private readonly AppDbContext _db;
    private readonly IPriceFeedService _priceFeed;

    public PnLCalculationService(AppDbContext db, IPriceFeedService priceFeed)
    {
        _db = db;
        _priceFeed = priceFeed;
    }

    public async Task<PnLDto> CalculatePnLAsync(Guid investmentId)
    {
        var inv = await _db.Investments.FindAsync(investmentId);
        if (inv == null) return new PnLDto();

        var txns = await _db.AssetTransactions
            .Where(t => t.InvestmentId == investmentId && (t.TxnType == "BUY" || t.TxnType == "SIP" || t.TxnType == "SELL"))
            .OrderBy(t => t.Date)
            .ToListAsync();

        var buyLots = new Queue<Lot>();
        decimal realisedPnl = 0;
        decimal ltcg = 0;
        decimal stcg = 0;

        // Is Equity? Stock, Equity MF, ELSS (simplified heuristic)
        bool isEquity = inv.AssetType == "Stock" || inv.AssetType == "ETF" || inv.Category == "Market";
        int ltcgDays = isEquity ? 365 : 1095; // 1 yr for equity, 3 yrs for debt

        foreach (var t in txns)
        {
            if (t.TxnType == "BUY" || t.TxnType == "SIP")
            {
                buyLots.Enqueue(new Lot { Date = t.Date, Units = t.Units, Price = t.Price });
            }
            else if (t.TxnType == "SELL")
            {
                decimal unitsToSell = t.Units;
                while (unitsToSell > 0 && buyLots.Count > 0)
                {
                    var oldestLot = buyLots.Peek();
                    decimal unitsSoldFromLot = Math.Min(unitsToSell, oldestLot.Units);
                    
                    decimal pnlForThisLot = (t.Price - oldestLot.Price) * unitsSoldFromLot;
                    realisedPnl += pnlForThisLot;

                    int holdingDays = (t.Date - oldestLot.Date).Days;
                    if (holdingDays > ltcgDays) ltcg += pnlForThisLot;
                    else stcg += pnlForThisLot;

                    oldestLot.Units -= unitsSoldFromLot;
                    unitsToSell -= unitsSoldFromLot;

                    if (oldestLot.Units <= 0) buyLots.Dequeue();
                }
            }
        }

        // Calculate unrealised based on remaining lots
        decimal remainingUnits = 0;
        decimal totalCost = 0;
        foreach (var lot in buyLots)
        {
            remainingUnits += lot.Units;
            totalCost += lot.Units * lot.Price;
        }

        decimal avgCost = remainingUnits > 0 ? totalCost / remainingUnits : 0;
        decimal currentValue = inv.CurrentValue; // Assumes updated by price feed
        decimal unrealisedPnl = currentValue - totalCost;

        return new PnLDto
        {
            RealisedPnL = Math.Round(realisedPnl, 2),
            UnrealisedPnL = Math.Round(unrealisedPnl, 2),
            AvgCost = Math.Round(avgCost, 2),
            RemainingUnits = Math.Round(remainingUnits, 4),
            LTCG = Math.Round(ltcg, 2),
            STCG = Math.Round(stcg, 2)
        };
    }

    private class Lot
    {
        public DateTime Date { get; set; }
        public decimal Units { get; set; }
        public decimal Price { get; set; }
    }

    public async Task<List<AssetPerformanceDto>> GetAssetPerformanceAsync(Guid userId, string assetCategory)
    {
        // assetCategory can be "MF", "Stock", "Other" etc. We will filter by AssetType
        var query = _db.Investments.Where(i => i.UserId == userId && (i.Status == "Active" || i.Status == null));
        
        if (assetCategory == "MF") query = query.Where(i => i.AssetType == "MF" || i.AssetType == "Mutual Fund");
        else if (assetCategory == "Stock") query = query.Where(i => i.AssetType == "Stock");
        else if (assetCategory == "Other") query = query.Where(i => i.AssetType != "MF" && i.AssetType != "Mutual Fund" && i.AssetType != "Stock");
        // if "All", do not filter

        var investments = await query.ToListAsync();

        // ── LIVE PRICE FETCH ──
        var priceRequests = investments
            .Where(i => !string.IsNullOrWhiteSpace(i.Ticker) && (i.AssetType == "Stock" || i.AssetType == "MF" || i.AssetType == "Mutual Fund" || i.AssetType == "Crypto"))
            .Select(i => (i.Ticker, Source: i.AssetType == "Crypto" ? "crypto" : (i.AssetType == "Stock" ? "yahoo" : "amfi")))
            .Distinct()
            .ToList();

        List<PriceResult> livePrices = new();
        if (priceRequests.Any())
        {
            livePrices = await _priceFeed.GetPricesBatchAsync(priceRequests!);
        }

        var results = new List<AssetPerformanceDto>();
        bool dbUpdated = false;

        foreach (var inv in investments)
        {
            // Call the existing single PnL calculate to get precise AvgCost and Units
            var pnlDto = await CalculatePnLAsync(inv.Id);

            // Apply live price if available
            if (!string.IsNullOrWhiteSpace(inv.Ticker) && livePrices.Any())
            {
                var live = livePrices.FirstOrDefault(p => p.Ticker == inv.Ticker && p.Price > 0);
                if (live != null)
                {
                    decimal activeUnits = pnlDto.RemainingUnits > 0 ? pnlDto.RemainingUnits : (inv.Quantity ?? 0m);
                    if (activeUnits > 0)
                    {
                        var newValue = live.Price * activeUnits;
                        if (inv.CurrentValue != newValue)
                        {
                            inv.CurrentValue = newValue;
                            dbUpdated = true;
                        }
                    }
                }
            }
            
            decimal pnl = inv.CurrentValue - inv.InvestedAmount;
            decimal pnlPct = inv.InvestedAmount > 0 ? (pnl / inv.InvestedAmount) * 100 : 0;

            decimal finalUnits = pnlDto.RemainingUnits > 0 ? pnlDto.RemainingUnits : (inv.Quantity ?? 0m);

            results.Add(new AssetPerformanceDto
            {
                InvestmentId = inv.Id,
                Name = inv.Name,
                Ticker = inv.Ticker ?? "",
                AssetType = inv.AssetType ?? "Other",
                Units = finalUnits,
                AvgCost = pnlDto.AvgCost > 0 ? pnlDto.AvgCost : (inv.BuyPrice ?? 0m),
                InvestedAmount = inv.InvestedAmount,
                CurrentValue = inv.CurrentValue,
                CurrentPrice = finalUnits > 0 ? Math.Round(inv.CurrentValue / finalUnits, 4) : 0,
                DateInvested = inv.DateInvested,
                OverallPnL = pnl,
                OverallPnLPct = pnlPct,
                LTCG = pnlDto.LTCG,
                STCG = pnlDto.STCG
            });
        }
        
        if (dbUpdated)
        {
            await _db.SaveChangesAsync();
        }

        return results.OrderByDescending(r => r.InvestedAmount).ToList();
    }

    public async Task<PortfolioSummaryDto> GetPortfolioSummaryAsync(Guid userId, string scope)
    {
        // Basic implementation for now, ignoring scope's couple-logic just to get it working for the user
        var investments = await _db.Investments
            .Where(i => i.UserId == userId && (i.Status == "Active" || i.Status == null))
            .ToListAsync();

        var summary = new PortfolioSummaryDto
        {
            TotalInvested = 0,
            CurrentValue = 0,
            OverallPnL = 0,
            OverallPnLPct = 0,
            DayChange = 0,
            DayChangePct = 0,
            Allocation = new Dictionary<string, decimal>(),
            TopGainers = new List<AssetPerformanceDto>(),
            TopLosers = new List<AssetPerformanceDto>()
        };

        var perfList = new List<AssetPerformanceDto>();

        foreach (var inv in investments)
        {
            summary.TotalInvested += inv.InvestedAmount;
            summary.CurrentValue += inv.CurrentValue;

            var atype = inv.AssetType ?? "Other";
            if (!summary.Allocation.ContainsKey(atype))
                summary.Allocation[atype] = 0;
            summary.Allocation[atype] += inv.CurrentValue;

            // Compute basic PnL for top gainers/losers
            decimal pnl = inv.CurrentValue - inv.InvestedAmount;
            decimal pnlPct = inv.InvestedAmount > 0 ? (pnl / inv.InvestedAmount) * 100 : 0;
            
            perfList.Add(new AssetPerformanceDto
            {
                InvestmentId = inv.Id,
                Name = inv.Name,
                Ticker = inv.Ticker ?? "",
                CurrentValue = inv.CurrentValue,
                OverallPnL = pnl,
                OverallPnLPct = pnlPct
            });
        }

        summary.OverallPnL = summary.CurrentValue - summary.TotalInvested;
        if (summary.TotalInvested > 0)
        {
            summary.OverallPnLPct = (summary.OverallPnL / summary.TotalInvested) * 100;
        }

        // Sort for top gainers/losers
        var sortedByPct = perfList.Where(p => p.OverallPnLPct != 0).OrderByDescending(p => p.OverallPnLPct).ToList();
        summary.TopGainers = sortedByPct.Take(3).ToList();
        summary.TopLosers = sortedByPct.AsEnumerable().Reverse().Take(3).ToList();

        return summary;
    }
}

public class PnLDto
{
    public decimal RealisedPnL { get; set; }
    public decimal UnrealisedPnL { get; set; }
    public decimal AvgCost { get; set; }
    public decimal RemainingUnits { get; set; }
    public decimal LTCG { get; set; }
    public decimal STCG { get; set; }
}

public class PortfolioSummaryDto
{
    public decimal TotalInvested { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal OverallPnL { get; set; }
    public decimal OverallPnLPct { get; set; }
    public decimal DayChange { get; set; }
    public decimal DayChangePct { get; set; }
    
    public Dictionary<string, decimal> Allocation { get; set; } = new();
    public List<AssetPerformanceDto> TopGainers { get; set; } = new();
    public List<AssetPerformanceDto> TopLosers { get; set; } = new();
}

public class AssetPerformanceDto
{
    public Guid InvestmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Ticker { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public decimal Units { get; set; }
    public decimal AvgCost { get; set; }
    public decimal InvestedAmount { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal OverallPnL { get; set; }
    public decimal OverallPnLPct { get; set; }
    public decimal LTCG { get; set; }
    public decimal STCG { get; set; }
    public decimal CurrentPrice { get; set; }
    public DateTime? DateInvested { get; set; }
}
