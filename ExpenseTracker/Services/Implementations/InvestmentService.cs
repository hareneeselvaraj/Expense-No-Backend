using ExpenseTracker.DTOs.Investment;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;
using ExpenseTracker.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services.Implementations;

public class InvestmentService : IInvestmentService
{
    private readonly IInvestmentRepository _investmentRepo;
    private readonly AMFIService _amfiService;
    private readonly AppDbContext _db;
    private readonly ILogger<InvestmentService> _logger;

    public InvestmentService(IInvestmentRepository investmentRepo, AMFIService amfiService, AppDbContext db, ILogger<InvestmentService> logger)
    {
        _investmentRepo = investmentRepo;
        _amfiService = amfiService;
        _db = db;
        _logger = logger;
    }

    public async Task<InvestmentResponseDto> CreateAsync(Guid userId, CreateInvestmentDto dto)
    {
        // Auto-derive category from AssetType
        var category = Investment.DeriveCategory(dto.AssetType);

        // Auto-compute Mutual Fund Unit Quantity using Historical NAV if missing
        _logger.LogInformation("Creating Investment -> AssetType: {0}, Ticker: {1}, Qty: {2}, Date: {3}", dto.AssetType, dto.Ticker, dto.Quantity, dto.DateInvested);
        if ((category == "Mutual Fund" || dto.AssetType == "Mutual Fund" || dto.AssetType == "MF") && (dto.Quantity == null || dto.Quantity <= 0))
        {
            if (!string.IsNullOrEmpty(dto.Ticker) && dto.DateInvested.HasValue && dto.InvestedAmount > 0)
            {
                _logger.LogInformation("Auto-computing Mutual Fund Units for {0} on {1}", dto.Ticker, dto.DateInvested.Value);
                var historicalNav = await _amfiService.GetHistoricalNavAsync(dto.Ticker.Trim(), dto.DateInvested.Value);
                
                if (historicalNav.HasValue && historicalNav.Value > 0)
                {
                    dto.Quantity = dto.InvestedAmount / historicalNav.Value;
                    dto.BuyPrice = historicalNav.Value;
                    _logger.LogInformation("Auto-computed NAV: {0}, Qty: {1}", historicalNav.Value, dto.Quantity);
                }
                else
                {
                    _logger.LogWarning("Failed to get historical NAV from AMFIService.");
                }
            }
        }

        var investment = new Investment
        {
            UserId = userId,
            Name = dto.Name,
            AssetType = dto.AssetType,
            Category = category,
            Ticker = dto.Ticker,
            Quantity = dto.Quantity,
            BuyPrice = dto.BuyPrice,
            InvestedAmount = dto.InvestedAmount,
            CurrentValue = dto.CurrentValue,
            Platform = dto.Platform,
            Notes = dto.Notes,
            DateInvested = dto.DateInvested,
            InterestRate = dto.InterestRate,
            TenureMonths = dto.TenureMonths,
            MonthlyAmount = dto.MonthlyAmount,
            InvestmentFrequency = dto.InvestmentFrequency,
            Status = "Active" // <-- Default to Active so it shows up in queries
        };

        // ── Deposit-specific initialization ──
        if (category == "Deposit")
        {
            investment.DateInvested ??= DateTime.UtcNow;

            bool isRD = string.Equals(dto.AssetType, "RD", StringComparison.OrdinalIgnoreCase);
            bool isFD = string.Equals(dto.AssetType, "FD", StringComparison.OrdinalIgnoreCase);
            bool isPPF = string.Equals(dto.AssetType, "PPF", StringComparison.OrdinalIgnoreCase);

            if (isRD && dto.MonthlyAmount.HasValue && dto.TenureMonths.HasValue)
            {
                // RD: first installment only
                investment.InvestedAmount = dto.MonthlyAmount.Value;
                investment.MonthsCompleted = 1;
                investment.LastProcessedDate = investment.DateInvested;
                investment.CurrentValue = investment.InvestedAmount;

                if (dto.InterestRate.HasValue)
                {
                    investment.ProjectedMaturityValue = CalcRDMaturity(
                        dto.MonthlyAmount.Value, dto.InterestRate.Value, dto.TenureMonths.Value);
                }
            }
            else if (isFD && dto.InterestRate.HasValue && dto.TenureMonths.HasValue)
            {
                // FD: lump sum, maturity = compound interest
                investment.ProjectedMaturityValue = CalcFDMaturity(
                    dto.InvestedAmount, dto.InterestRate.Value, dto.TenureMonths.Value);
                investment.CurrentValue = investment.InvestedAmount;
                investment.MonthsCompleted = 0;
                investment.LastProcessedDate = investment.DateInvested;
            }
            else if (isPPF && dto.InterestRate.HasValue)
            {
                // PPF: projected over 15 years
                investment.ProjectedMaturityValue = CalcPPFProjected(
                    dto.InvestedAmount, dto.InterestRate.Value,
                    dto.InvestmentFrequency ?? "Monthly");
                investment.CurrentValue = investment.InvestedAmount;
            }
            else
            {
                // SSY or other deposit: just set current = invested
                investment.CurrentValue = investment.InvestedAmount;
            }
        }

        await _investmentRepo.AddAsync(investment);
        return MapToDto(investment);
    }

    public async Task<IEnumerable<InvestmentResponseDto>> GetAllAsync(Guid userId)
    {
        var investments = await _investmentRepo.GetByUserIdAsync(userId);
        return investments.Select(MapToDto);
    }

    public async Task<InvestmentResponseDto?> GetByIdAsync(Guid userId, Guid id)
    {
        var investment = await _investmentRepo.GetByIdAsync(id);
        if (investment == null || investment.UserId != userId) return null;
        return MapToDto(investment);
    }

    public async Task<InvestmentResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateInvestmentDto dto)
    {
        var investment = await _investmentRepo.GetByIdAsync(id);
        if (investment == null || investment.UserId != userId) return null;

        if (dto.Name != null) investment.Name = dto.Name;
        if (dto.Ticker != null) investment.Ticker = dto.Ticker;
        if (dto.AssetType != null)
        {
            investment.AssetType = dto.AssetType;
            investment.Category = Investment.DeriveCategory(dto.AssetType);
        }
        if (dto.Quantity.HasValue) investment.Quantity = dto.Quantity.Value;
        if (dto.BuyPrice.HasValue) investment.BuyPrice = dto.BuyPrice.Value;
        if (dto.Platform != null) investment.Platform = dto.Platform;
        if (dto.Notes != null) investment.Notes = dto.Notes;
        if (dto.DateInvested.HasValue) investment.DateInvested = dto.DateInvested.Value;
        if (dto.InterestRate.HasValue) investment.InterestRate = dto.InterestRate.Value;
        if (dto.TenureMonths.HasValue) investment.TenureMonths = dto.TenureMonths.Value;
        if (dto.MonthlyAmount.HasValue) investment.MonthlyAmount = dto.MonthlyAmount.Value;
        if (dto.InvestmentFrequency != null) investment.InvestmentFrequency = dto.InvestmentFrequency;

        bool isDeposit = investment.Category == "Deposit";
        bool isRD = string.Equals(investment.AssetType, "RD", StringComparison.OrdinalIgnoreCase);

        // For Deposits: InvestedAmount and CurrentValue are system-managed
        if (!isDeposit)
        {
            if (dto.InvestedAmount.HasValue) investment.InvestedAmount = dto.InvestedAmount.Value;
            if (dto.CurrentValue.HasValue) investment.CurrentValue = dto.CurrentValue.Value;
        }

        // Recalculate maturity if deposit params changed
        if (isDeposit)
        {
            if (isRD && investment.MonthlyAmount.HasValue && investment.TenureMonths.HasValue && investment.InterestRate.HasValue)
            {
                investment.ProjectedMaturityValue = CalcRDMaturity(
                    investment.MonthlyAmount.Value, investment.InterestRate.Value, investment.TenureMonths.Value);
                investment.CurrentValue = investment.InvestedAmount;
            }
            else if (string.Equals(investment.AssetType, "FD", StringComparison.OrdinalIgnoreCase)
                     && investment.InterestRate.HasValue && investment.TenureMonths.HasValue)
            {
                investment.ProjectedMaturityValue = CalcFDMaturity(
                    investment.InvestedAmount, investment.InterestRate.Value, investment.TenureMonths.Value);
                investment.CurrentValue = investment.InvestedAmount;
            }
            else if (string.Equals(investment.AssetType, "PPF", StringComparison.OrdinalIgnoreCase)
                     && investment.InterestRate.HasValue)
            {
                investment.ProjectedMaturityValue = CalcPPFProjected(
                    investment.InvestedAmount, investment.InterestRate.Value,
                    investment.InvestmentFrequency ?? "Monthly");
                investment.CurrentValue = investment.InvestedAmount;
            }
        }

        await _investmentRepo.UpdateAsync(investment);
        return MapToDto(investment);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id)
    {
        var investment = await _investmentRepo.GetByIdAsync(id);
        if (investment == null || investment.UserId != userId) return false;

        await _investmentRepo.DeleteAsync(investment);
        return true;
    }

    public async Task<InvestmentResponseDto?> SellAsync(Guid userId, Guid id, SellInvestmentDto dto)
    {
        var investment = await _db.Investments.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
        if (investment == null) return null;

        if (investment.Quantity == null || dto.SellQuantity <= 0 || dto.SellQuantity > investment.Quantity.Value)
        {
            throw new InvalidOperationException("Invalid sell quantity. Must be strongly greater than 0 and less than or equal to current holdings.");
        }

        // 1. Record the SELL Transaction
        var sellTxn = new AssetTransaction
        {
            InvestmentId = investment.Id,
            TxnType = "SELL",
            Date = dto.SellDate,
            Units = dto.SellQuantity,
            Price = dto.SellPrice,
            Amount = dto.SellQuantity * dto.SellPrice,
            Notes = dto.Notes
        };
        _db.AssetTransactions.Add(sellTxn);

        // 2. Adjust Investment Balance
        decimal ratioSold = dto.SellQuantity / investment.Quantity.Value;
        decimal investedAmountSold = investment.InvestedAmount * ratioSold;

        investment.Quantity -= dto.SellQuantity;
        investment.InvestedAmount -= investedAmountSold;

        // If completely sold, mark as inactive/matured or zero out
        if (investment.Quantity <= 0.0001m)
        {
            investment.Quantity = 0;
            investment.InvestedAmount = 0;
            investment.CurrentValue = 0;
            investment.Status = "Sold";
        }
        else
        {
            // Adjust current value proportionally so UI doesn't break until next price update
            investment.CurrentValue -= (investment.CurrentValue * ratioSold);
        }

        await _db.SaveChangesAsync();
        return MapToDto(investment);
    }

    public async Task<IEnumerable<AssetTransactionDto>> GetTransactionsAsync(Guid userId, Guid? investmentId = null)
    {
        var query = _db.AssetTransactions
            .Include(t => t.Investment)
            .Where(t => t.Investment.UserId == userId)
            .AsQueryable();

        if (investmentId.HasValue)
        {
            query = query.Where(t => t.InvestmentId == investmentId.Value);
        }

        var txns = await query.OrderByDescending(t => t.Date).ToListAsync();

        return txns.Select(t => new AssetTransactionDto
        {
            Id = t.Id,
            InvestmentId = t.InvestmentId,
            InvestmentName = t.Investment.Name,
            AssetType = t.Investment.AssetType,
            Ticker = t.Investment.Ticker,
            TxnType = t.TxnType,
            Date = t.Date,
            Units = t.Units,
            Price = t.Price,
            Amount = t.Amount,
            Notes = t.Notes
        });
    }

    // ── RD Maturity Formula (monthly compounding) ──
    private static decimal CalcRDMaturity(decimal monthly, decimal ratePercent, int tenureMonths)
    {
        double r = (double)ratePercent / 100.0 / 12.0;
        double maturity = 0;
        for (int i = 0; i < tenureMonths; i++)
        {
            int monthsRemaining = tenureMonths - i;
            maturity += (double)monthly * Math.Pow(1 + r, monthsRemaining);
        }
        return Math.Round((decimal)maturity, 2);
    }

    // ── FD Maturity Formula (quarterly compounding) ──
    private static decimal CalcFDMaturity(decimal principal, decimal ratePercent, int tenureMonths)
    {
        double r = (double)ratePercent / 100.0;
        int n = 4; // quarterly compounding
        double t = tenureMonths / 12.0;
        double maturity = (double)principal * Math.Pow(1 + r / n, n * t);
        return Math.Round((decimal)maturity, 2);
    }

    // ── PPF Projected (annual compounding, 15yr default) ──
    private static decimal CalcPPFProjected(decimal amount, decimal ratePercent, string frequency, int tenureYears = 15)
    {
        double annualDeposit = string.Equals(frequency, "Yearly", StringComparison.OrdinalIgnoreCase)
            ? (double)amount
            : (double)amount * 12;
        double r = (double)ratePercent / 100.0;
        double balance = 0;
        for (int y = 0; y < tenureYears; y++)
        {
            balance = (balance + annualDeposit) * (1 + r);
        }
        return Math.Round((decimal)balance, 2);
    }

    private static InvestmentResponseDto MapToDto(Investment i) => new()
    {
        Id = i.Id,
        Name = i.Name,
        AssetType = i.AssetType,
        Category = i.Category,
        Quantity = i.Quantity,
        BuyPrice = i.BuyPrice,
        InvestedAmount = i.InvestedAmount,
        CurrentValue = i.CurrentValue,
        Platform = i.Platform,
        Notes = i.Notes,
        DateInvested = i.DateInvested,
        ROI = i.ROI,
        InterestRate = i.InterestRate,
        TenureMonths = i.TenureMonths,
        MonthlyAmount = i.MonthlyAmount,
        InvestmentFrequency = i.InvestmentFrequency,
        Status = i.Status,
        MonthsCompleted = i.MonthsCompleted,
        LastProcessedDate = i.LastProcessedDate,
        ProjectedMaturityValue = i.ProjectedMaturityValue,
    };
}
