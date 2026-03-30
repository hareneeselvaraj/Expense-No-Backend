using ExpenseTracker.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services.Implementations;

public class XIRRService
{
    private readonly AppDbContext _db;

    public XIRRService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<decimal> CalculateXIRRAsync(Guid investmentId)
    {
        var inv = await _db.Investments.FindAsync(investmentId);
        if (inv == null || inv.CurrentValue <= 0) return 0m;

        var txns = await _db.AssetTransactions
            .Where(t => t.InvestmentId == investmentId)
            .OrderBy(t => t.Date)
            .ToListAsync();

        if (txns.Count == 0 && inv.InvestedAmount <= 0) return 0m;

        var cashflows = new List<Cashflow>();

        // If no discrete transactions, synthetic from InvestedAmount
        if (txns.Count == 0)
        {
            cashflows.Add(new Cashflow { Amount = -(double)inv.InvestedAmount, Date = inv.DateInvested ?? DateTime.UtcNow.AddYears(-1) });
        }
        else
        {
            foreach (var t in txns)
            {
                if (t.TxnType == "BUY" || t.TxnType == "SIP")
                {
                    cashflows.Add(new Cashflow { Amount = -(double)t.Amount, Date = t.Date });
                }
                else if (t.TxnType == "SELL" || t.TxnType == "DIVIDEND")
                {
                    cashflows.Add(new Cashflow { Amount = (double)t.Amount, Date = t.Date });
                }
            }
        }

        // Add final positive cashflow representing current portfolio value
        cashflows.Add(new Cashflow { Amount = (double)inv.CurrentValue, Date = DateTime.UtcNow });

        return Math.Round((decimal)CalculateXIRR(cashflows) * 100, 2); // Return as percentage
    }

    private class Cashflow
    {
        public double Amount { get; set; }
        public DateTime Date { get; set; }
    }

    private double CalculateXIRR(List<Cashflow> cashflows)
    {
        if (cashflows.Count < 2) return 0;

        // Ensure there is at least one negative and one positive cashflow
        bool hasNegative = cashflows.Exists(c => c.Amount < 0);
        bool hasPositive = cashflows.Exists(c => c.Amount > 0);
        if (!hasNegative || !hasPositive) return 0;

        double guess = 0.1;
        double maxError = 0.0001;
        int maxIter = 100;
        
        DateTime d0 = cashflows[0].Date;

        for (int i = 0; i < maxIter; i++)
        {
            double f = 0.0;
            double df = 0.0;

            foreach (var c in cashflows)
            {
                double days = (c.Date - d0).TotalDays;
                double term = Math.Pow(1.0 + guess, days / 365.0);
                f += c.Amount / term;
                df += -days / 365.0 * c.Amount / (term * (1.0 + guess));
            }

            double newGuess = guess - f / df;
            if (Math.Abs(newGuess - guess) < maxError) return newGuess;
            guess = newGuess;
        }

        return guess;
    }
}
