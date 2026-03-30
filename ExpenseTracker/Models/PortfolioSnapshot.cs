using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class PortfolioSnapshot
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalInvested { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPnl { get; set; }

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
