using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class PriceCache
{
    [Key]
    [MaxLength(50)]
    public string Ticker { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,4)")]
    public decimal Price { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "INR";

    [MaxLength(50)]
    public string Source { get; set; } = string.Empty;

    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
}
