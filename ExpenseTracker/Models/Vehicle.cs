using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class Vehicle
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string VehicleType { get; set; } = "Car"; // Car, Bike

    [Required, MaxLength(20)]
    public string FuelType { get; set; } = "Petrol"; // Petrol, Diesel, Electric

    [MaxLength(20)]
    public string? RegistrationNumber { get; set; }

    public int? ServiceIntervalKm { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public ICollection<FuelEntry> FuelEntries { get; set; } = new List<FuelEntry>();
}
