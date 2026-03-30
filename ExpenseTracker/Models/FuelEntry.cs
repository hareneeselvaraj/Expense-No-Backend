using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class FuelEntry
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid VehicleId { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    /// <summary>Current odometer reading in km.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal OdometerReading { get; set; }

    /// <summary>Fuel quantity in liters.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal FuelQuantity { get; set; }

    /// <summary>Total fuel cost in ₹.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal FuelCost { get; set; }

    /// <summary>Price per liter (optional, auto-calculated if null).</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? PricePerLiter { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(VehicleId))]
    public Vehicle Vehicle { get; set; } = null!;
}
