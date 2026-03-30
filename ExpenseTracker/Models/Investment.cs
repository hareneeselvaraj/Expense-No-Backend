using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class Investment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? AssetType { get; set; }  // Stock, Mutual Fund, ETF, NPS, Crypto, FD, RD, PPF, SSY, Gold, Silver, Land, Real Estate

    // ── Category: auto-derived from AssetType ──
    // "Market" | "Deposit" | "Physical"
    [MaxLength(20)]
    public string? Category { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal? Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? BuyPrice { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal InvestedAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentValue { get; set; }

    [MaxLength(100)]
    public string? Platform { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime? DateInvested { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? InterestRate { get; set; }      // FD, RD, PPF, SSY

    public int? TenureMonths { get; set; }           // FD, RD (in months)

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MonthlyAmount { get; set; }      // RD monthly installment

    [MaxLength(20)]
    public string? InvestmentFrequency { get; set; } // PPF: "Monthly" or "Yearly"

    // ── Deposit lifecycle fields ──
    [MaxLength(20)]
    public string? Status { get; set; }              // "Active" | "Matured"

    public int? MonthsCompleted { get; set; }        // installments deposited so far

    public DateTime? LastProcessedDate { get; set; } // last auto-processed date

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ProjectedMaturityValue { get; set; } // pre-calculated maturity

    // ── Live Price Feed fields ──
    [MaxLength(50)]
    public string? Ticker { get; set; }                  // e.g., "TCS.NS", "BTC-USD", "119598"

    [MaxLength(20)]
    public string? PriceSource { get; set; }             // "yahoo" | "mfapi" | "manual"

    public DateTime? LastPriceUpdate { get; set; }

    [MaxLength(50)]
    public string? ISIN { get; set; }

    [MaxLength(50)]
    public string? SchemeCode { get; set; }

    [MaxLength(100)]
    public string? SectorTag { get; set; }

    [NotMapped]
    public int HoldingPeriodDays => DateInvested.HasValue 
        ? (int)(DateTime.UtcNow - DateInvested.Value).TotalDays 
        : 0;

    /// <summary>
    /// ROI = ((CurrentValue - InvestedAmount) / InvestedAmount) * 100
    /// </summary>
    [NotMapped]
    public decimal ROI => InvestedAmount != 0
        ? ((CurrentValue - InvestedAmount) / InvestedAmount) * 100
        : 0;

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    // ── Category helper: derives category from AssetType ──
    private static readonly HashSet<string> MarketTypes = new(StringComparer.OrdinalIgnoreCase)
        { "Stock", "Mutual Fund", "ETF", "NPS", "Crypto" };

    private static readonly HashSet<string> DepositTypes = new(StringComparer.OrdinalIgnoreCase)
        { "FD", "RD", "PPF", "SSY" };

    public static string DeriveCategory(string? assetType)
    {
        if (string.IsNullOrWhiteSpace(assetType)) return "Physical";
        if (MarketTypes.Contains(assetType)) return "Market";
        if (DepositTypes.Contains(assetType)) return "Deposit";
        return "Physical"; // Gold, Silver, Land, Real Estate, etc.
    }
}
