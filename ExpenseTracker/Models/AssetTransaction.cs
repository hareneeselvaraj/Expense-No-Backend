using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class AssetTransaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid InvestmentId { get; set; }

    [Required, MaxLength(20)]
    public string TxnType { get; set; } = "BUY"; // BUY, SELL, DIVIDEND, SIP, BONUS

    [Required]
    public DateTime Date { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal Units { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    // Navigation
    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;
}
