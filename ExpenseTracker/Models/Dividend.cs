using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class Dividend
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid InvestmentId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(20)]
    public string Type { get; set; } = "DIVIDEND"; // DIVIDEND, INTEREST, BONUS

    // Navigation
    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;
}
