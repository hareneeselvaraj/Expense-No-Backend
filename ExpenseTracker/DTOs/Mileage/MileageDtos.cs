using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.DTOs.Mileage;

// ───────────────────── Vehicle DTOs ─────────────────────

public class CreateVehicleDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string VehicleType { get; set; } = "Car";

    [Required, MaxLength(20)]
    public string FuelType { get; set; } = "Petrol";

    [MaxLength(20)]
    public string? RegistrationNumber { get; set; }

    public int? ServiceIntervalKm { get; set; }
}

public class UpdateVehicleDto
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(10)]
    public string? VehicleType { get; set; }

    [MaxLength(20)]
    public string? FuelType { get; set; }

    [MaxLength(20)]
    public string? RegistrationNumber { get; set; }

    public int? ServiceIntervalKm { get; set; }
}

public class VehicleResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public string FuelType { get; set; } = string.Empty;
    public string? RegistrationNumber { get; set; }
    public int? ServiceIntervalKm { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ───────────────────── Fuel Entry DTOs ─────────────────────

public class CreateFuelEntryDto
{
    [Required]
    public Guid VehicleId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public decimal OdometerReading { get; set; }

    [Required]
    public decimal FuelQuantity { get; set; }

    [Required]
    public decimal FuelCost { get; set; }

    public decimal? PricePerLiter { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateFuelEntryDto
{
    public DateTime? Date { get; set; }
    public decimal? OdometerReading { get; set; }
    public decimal? FuelQuantity { get; set; }
    public decimal? FuelCost { get; set; }
    public decimal? PricePerLiter { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class FuelEntryResponseDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal OdometerReading { get; set; }
    public decimal FuelQuantity { get; set; }
    public decimal FuelCost { get; set; }
    public decimal PricePerLiter { get; set; }
    public string? Notes { get; set; }

    // Calculated
    public decimal? DistanceKm { get; set; }
    public decimal? Mileage { get; set; } // km/L
}

// ───────────────────── Summary DTOs ─────────────────────

public class MileageSummaryDto
{
    public decimal TotalDistanceKm { get; set; }
    public decimal TotalFuelSpent { get; set; }
    public decimal TotalFuelLiters { get; set; }
    public decimal AvgMileage { get; set; }
    public decimal CostPerKm { get; set; }
    public List<VehicleSummaryDto> Vehicles { get; set; } = new();
    public List<MonthlyMileageDto> MonthlyTrend { get; set; } = new();
    public List<MileageAlertDto> Alerts { get; set; } = new();
}

public class VehicleSummaryDto
{
    public Guid VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public string FuelType { get; set; } = string.Empty;
    public decimal TotalDistanceKm { get; set; }
    public decimal TotalFuelSpent { get; set; }
    public decimal AvgMileage { get; set; }
    public decimal CostPerKm { get; set; }
    public decimal LatestOdometer { get; set; }
    public int EntryCount { get; set; }
}

public class MonthlyMileageDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string Label { get; set; } = string.Empty; // "Jan 2026"
    public decimal DistanceKm { get; set; }
    public decimal FuelSpent { get; set; }
    public decimal AvgMileage { get; set; }
    public decimal CostPerKm { get; set; }
}

public class MileageAlertDto
{
    public string Type { get; set; } = string.Empty; // "MileageDrop", "ServiceDue", "CostSpike"
    public string Severity { get; set; } = "warning"; // "warning", "danger", "info"
    public string Message { get; set; } = string.Empty;
    public string VehicleName { get; set; } = string.Empty;
}
