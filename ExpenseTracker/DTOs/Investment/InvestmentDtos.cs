using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.DTOs.Investment;

public class CreateInvestmentDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? AssetType { get; set; }

    [MaxLength(50)]
    public string? Ticker { get; set; }

    public decimal? Quantity { get; set; }
    public decimal? BuyPrice { get; set; }

    [Required]
    public decimal InvestedAmount { get; set; }

    public decimal CurrentValue { get; set; }

    [MaxLength(100)]
    public string? Platform { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime? DateInvested { get; set; }

    public decimal? InterestRate { get; set; }
    public int? TenureMonths { get; set; }
    public decimal? MonthlyAmount { get; set; }

    [MaxLength(20)]
    public string? InvestmentFrequency { get; set; }
}

public class UpdateInvestmentDto
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? AssetType { get; set; }

    [MaxLength(50)]
    public string? Ticker { get; set; }

    public decimal? Quantity { get; set; }
    public decimal? BuyPrice { get; set; }
    public decimal? InvestedAmount { get; set; }
    public decimal? CurrentValue { get; set; }

    [MaxLength(100)]
    public string? Platform { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime? DateInvested { get; set; }

    public decimal? InterestRate { get; set; }
    public int? TenureMonths { get; set; }
    public decimal? MonthlyAmount { get; set; }

    [MaxLength(20)]
    public string? InvestmentFrequency { get; set; }
}

public class InvestmentResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AssetType { get; set; }
    public string? Category { get; set; }       // "Market" | "Deposit" | "Physical"
    public string? Ticker { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? BuyPrice { get; set; }
    public decimal InvestedAmount { get; set; }
    public decimal CurrentValue { get; set; }
    public string? Platform { get; set; }
    public string? Notes { get; set; }
    public DateTime? DateInvested { get; set; }
    public decimal ROI { get; set; }
    public decimal? InterestRate { get; set; }
    public int? TenureMonths { get; set; }
    public decimal? MonthlyAmount { get; set; }
    public string? InvestmentFrequency { get; set; }

    // Deposit lifecycle
    public string? Status { get; set; }
    public int? MonthsCompleted { get; set; }
    public DateTime? LastProcessedDate { get; set; }
    public decimal? ProjectedMaturityValue { get; set; }
}

public class SellInvestmentDto
{
    [Required]
    public decimal SellQuantity { get; set; }

    [Required]
    public decimal SellPrice { get; set; }

    [Required]
    public DateTime SellDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class AssetTransactionDto
{
    public Guid Id { get; set; }
    public Guid InvestmentId { get; set; }
    public string InvestmentName { get; set; } = string.Empty;
    public string? AssetType { get; set; }
    public string? Ticker { get; set; }
    public string TxnType { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Units { get; set; }
    public decimal Price { get; set; }
    public decimal Amount { get; set; } // For BUY: cost, For SELL: revenue
    public string? Notes { get; set; }
}
