using ExpenseTracker.DTOs.Mileage;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Services.Implementations;

public class MileageService : IMileageService
{
    private readonly IVehicleRepository _vehicleRepo;
    private readonly IFuelEntryRepository _fuelEntryRepo;

    public MileageService(IVehicleRepository vehicleRepo, IFuelEntryRepository fuelEntryRepo)
    {
        _vehicleRepo = vehicleRepo;
        _fuelEntryRepo = fuelEntryRepo;
    }

    // ───────────────────── Vehicle CRUD ─────────────────────

    public async Task<VehicleResponseDto> CreateVehicleAsync(Guid userId, CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            UserId = userId,
            Name = dto.Name,
            VehicleType = dto.VehicleType,
            FuelType = dto.FuelType,
            RegistrationNumber = dto.RegistrationNumber,
            ServiceIntervalKm = dto.ServiceIntervalKm
        };
        await _vehicleRepo.AddAsync(vehicle);
        return MapVehicle(vehicle);
    }

    public async Task<IEnumerable<VehicleResponseDto>> GetVehiclesAsync(Guid userId)
    {
        var vehicles = await _vehicleRepo.GetByUserIdAsync(userId);
        return vehicles.Select(MapVehicle);
    }

    public async Task<VehicleResponseDto?> UpdateVehicleAsync(Guid userId, Guid id, UpdateVehicleDto dto)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(id);
        if (vehicle == null || vehicle.UserId != userId) return null;

        if (dto.Name != null) vehicle.Name = dto.Name;
        if (dto.VehicleType != null) vehicle.VehicleType = dto.VehicleType;
        if (dto.FuelType != null) vehicle.FuelType = dto.FuelType;
        if (dto.RegistrationNumber != null) vehicle.RegistrationNumber = dto.RegistrationNumber;
        if (dto.ServiceIntervalKm.HasValue) vehicle.ServiceIntervalKm = dto.ServiceIntervalKm;

        await _vehicleRepo.UpdateAsync(vehicle);
        return MapVehicle(vehicle);
    }

    public async Task<bool> DeleteVehicleAsync(Guid userId, Guid id)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(id);
        if (vehicle == null || vehicle.UserId != userId) return false;
        await _vehicleRepo.DeleteAsync(vehicle);
        return true;
    }

    // ───────────────────── Fuel Entry CRUD ─────────────────────

    public async Task<FuelEntryResponseDto> CreateFuelEntryAsync(Guid userId, CreateFuelEntryDto dto)
    {
        var entry = new FuelEntry
        {
            UserId = userId,
            VehicleId = dto.VehicleId,
            Date = dto.Date,
            OdometerReading = dto.OdometerReading,
            FuelQuantity = dto.FuelQuantity,
            FuelCost = dto.FuelCost,
            PricePerLiter = dto.PricePerLiter ?? (dto.FuelQuantity > 0 ? dto.FuelCost / dto.FuelQuantity : null),
            Notes = dto.Notes
        };
        await _fuelEntryRepo.AddAsync(entry);

        // Fetch all entries for this vehicle to calculate distance/mileage
        var allEntries = (await _fuelEntryRepo.GetByVehicleIdAsync(dto.VehicleId))
            .OrderBy(e => e.OdometerReading).ToList();

        return MapFuelEntry(entry, allEntries);
    }

    public async Task<IEnumerable<FuelEntryResponseDto>> GetFuelEntriesAsync(Guid userId, Guid? vehicleId)
    {
        IEnumerable<FuelEntry> entries;
        if (vehicleId.HasValue)
            entries = await _fuelEntryRepo.GetByVehicleIdAsync(vehicleId.Value);
        else
            entries = await _fuelEntryRepo.GetByUserIdAsync(userId);

        // Group entries by vehicle for mileage calculation
        var grouped = entries.GroupBy(e => e.VehicleId);
        var result = new List<FuelEntryResponseDto>();

        foreach (var group in grouped)
        {
            var sorted = group.OrderBy(e => e.OdometerReading).ToList();
            foreach (var entry in group.OrderByDescending(e => e.Date).ThenByDescending(e => e.OdometerReading))
            {
                result.Add(MapFuelEntry(entry, sorted));
            }
        }

        return result;
    }

    public async Task<FuelEntryResponseDto?> UpdateFuelEntryAsync(Guid userId, Guid id, UpdateFuelEntryDto dto)
    {
        var entry = await _fuelEntryRepo.GetByIdAsync(id);
        if (entry == null || entry.UserId != userId) return null;

        if (dto.Date.HasValue) entry.Date = dto.Date.Value;
        if (dto.OdometerReading.HasValue) entry.OdometerReading = dto.OdometerReading.Value;
        if (dto.FuelQuantity.HasValue) entry.FuelQuantity = dto.FuelQuantity.Value;
        if (dto.FuelCost.HasValue) entry.FuelCost = dto.FuelCost.Value;
        if (dto.PricePerLiter.HasValue) entry.PricePerLiter = dto.PricePerLiter.Value;
        else if (dto.FuelCost.HasValue || dto.FuelQuantity.HasValue)
            entry.PricePerLiter = entry.FuelQuantity > 0 ? entry.FuelCost / entry.FuelQuantity : null;
        if (dto.Notes != null) entry.Notes = dto.Notes;

        await _fuelEntryRepo.UpdateAsync(entry);

        var allEntries = (await _fuelEntryRepo.GetByVehicleIdAsync(entry.VehicleId))
            .OrderBy(e => e.OdometerReading).ToList();
        return MapFuelEntry(entry, allEntries);
    }

    public async Task<bool> DeleteFuelEntryAsync(Guid userId, Guid id)
    {
        var entry = await _fuelEntryRepo.GetByIdAsync(id);
        if (entry == null || entry.UserId != userId) return false;
        await _fuelEntryRepo.DeleteAsync(entry);
        return true;
    }

    // ───────────────────── Summary / Dashboard ─────────────────────

    public async Task<MileageSummaryDto> GetMileageSummaryAsync(Guid userId)
    {
        var vehicles = (await _vehicleRepo.GetByUserIdAsync(userId)).ToList();
        var allEntries = (await _fuelEntryRepo.GetByUserIdAsync(userId)).ToList();

        var summary = new MileageSummaryDto();
        var alerts = new List<MileageAlertDto>();

        foreach (var vehicle in vehicles)
        {
            var vEntries = allEntries
                .Where(e => e.VehicleId == vehicle.Id)
                .OrderBy(e => e.OdometerReading)
                .ToList();

            if (vEntries.Count < 2)
            {
                summary.Vehicles.Add(new VehicleSummaryDto
                {
                    VehicleId = vehicle.Id,
                    VehicleName = vehicle.Name,
                    VehicleType = vehicle.VehicleType,
                    FuelType = vehicle.FuelType,
                    LatestOdometer = vEntries.LastOrDefault()?.OdometerReading ?? 0,
                    EntryCount = vEntries.Count,
                    TotalFuelSpent = vEntries.Sum(e => e.FuelCost)
                });
                summary.TotalFuelSpent += vEntries.Sum(e => e.FuelCost);
                summary.TotalFuelLiters += vEntries.Sum(e => e.FuelQuantity);
                continue;
            }

            decimal totalDist = vEntries.Last().OdometerReading - vEntries.First().OdometerReading;
            decimal totalFuel = vEntries.Skip(1).Sum(e => e.FuelQuantity); // first entry is baseline
            decimal totalCost = vEntries.Skip(1).Sum(e => e.FuelCost);
            decimal avgMileage = totalFuel > 0 ? totalDist / totalFuel : 0;
            decimal costPerKm = totalDist > 0 ? totalCost / totalDist : 0;

            summary.TotalDistanceKm += totalDist;
            summary.TotalFuelSpent += totalCost;
            summary.TotalFuelLiters += totalFuel;

            summary.Vehicles.Add(new VehicleSummaryDto
            {
                VehicleId = vehicle.Id,
                VehicleName = vehicle.Name,
                VehicleType = vehicle.VehicleType,
                FuelType = vehicle.FuelType,
                TotalDistanceKm = totalDist,
                TotalFuelSpent = totalCost,
                AvgMileage = Math.Round(avgMileage, 2),
                CostPerKm = Math.Round(costPerKm, 2),
                LatestOdometer = vEntries.Last().OdometerReading,
                EntryCount = vEntries.Count
            });

            // ── Alerts ──
            // Mileage drop: compare last 3 entries avg vs overall avg
            if (vEntries.Count >= 4)
            {
                var recent = new List<decimal>();
                for (int i = vEntries.Count - 1; i >= Math.Max(1, vEntries.Count - 3); i--)
                {
                    var dist = vEntries[i].OdometerReading - vEntries[i - 1].OdometerReading;
                    if (vEntries[i].FuelQuantity > 0)
                        recent.Add(dist / vEntries[i].FuelQuantity);
                }
                if (recent.Count > 0)
                {
                    var recentAvg = recent.Average();
                    if (avgMileage > 0 && (decimal)recentAvg < avgMileage * 0.8m)
                    {
                        alerts.Add(new MileageAlertDto
                        {
                            Type = "MileageDrop",
                            Severity = "danger",
                            Message = $"Mileage dropped to {Math.Round((decimal)recentAvg, 1)} km/L (avg {Math.Round(avgMileage, 1)} km/L)",
                            VehicleName = vehicle.Name
                        });
                    }
                }
            }

            // Service reminder
            if (vehicle.ServiceIntervalKm.HasValue && totalDist > 0)
            {
                var lastOdo = vEntries.Last().OdometerReading;
                var kmSinceService = lastOdo % vehicle.ServiceIntervalKm.Value;
                var remaining = vehicle.ServiceIntervalKm.Value - kmSinceService;
                if (remaining <= 500)
                {
                    alerts.Add(new MileageAlertDto
                    {
                        Type = "ServiceDue",
                        Severity = remaining <= 100 ? "danger" : "warning",
                        Message = $"Service due in ~{Math.Round(remaining, 0)} km (interval: {vehicle.ServiceIntervalKm} km)",
                        VehicleName = vehicle.Name
                    });
                }
            }

            // Fuel cost spike: compare last price vs avg price
            if (vEntries.Count >= 3)
            {
                var avgPrice = vEntries.Where(e => e.PricePerLiter > 0).Average(e => (decimal)e.PricePerLiter!);
                var lastPrice = vEntries.Last().PricePerLiter ?? 0;
                if (avgPrice > 0 && lastPrice > avgPrice * 1.15m)
                {
                    alerts.Add(new MileageAlertDto
                    {
                        Type = "CostSpike",
                        Severity = "warning",
                        Message = $"Fuel price ₹{Math.Round(lastPrice, 2)}/L is {Math.Round((lastPrice / avgPrice - 1) * 100, 0)}% above average",
                        VehicleName = vehicle.Name
                    });
                }
            }
        }

        summary.AvgMileage = summary.TotalFuelLiters > 0
            ? Math.Round(summary.TotalDistanceKm / summary.TotalFuelLiters, 2) : 0;
        summary.CostPerKm = summary.TotalDistanceKm > 0
            ? Math.Round(summary.TotalFuelSpent / summary.TotalDistanceKm, 2) : 0;
        summary.Alerts = alerts;

        // ── Monthly Trend ──
        var trendMap = new Dictionary<(int Year, int Month), (decimal Dist, decimal Fuel, decimal Cost)>();
        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);
        var cutoff = new DateTime(twelveMonthsAgo.Year, twelveMonthsAgo.Month, 1);

        foreach (var vehicle in vehicles)
        {
            var vEntries = allEntries
                .Where(e => e.VehicleId == vehicle.Id)
                .OrderBy(e => e.OdometerReading)
                .ToList();

            // Iterate pairs to calculate distance accurately
            for (int i = 1; i < vEntries.Count; i++)
            {
                var entry = vEntries[i];
                var prev = vEntries[i - 1];

                // Attribute distance and fuel to the month of the current fill-up
                if (entry.Date >= cutoff)
                {
                    var key = (entry.Date.Year, entry.Date.Month);
                    if (!trendMap.ContainsKey(key)) trendMap[key] = (0, 0, 0);

                    var val = trendMap[key];
                    trendMap[key] = (
                        val.Dist + (entry.OdometerReading - prev.OdometerReading),
                        val.Fuel + entry.FuelQuantity,
                        val.Cost + entry.FuelCost
                    );
                }
            }
        }

        foreach (var item in trendMap.OrderBy(t => t.Key.Year).ThenBy(t => t.Key.Month))
        {
            summary.MonthlyTrend.Add(new MonthlyMileageDto
            {
                Year = item.Key.Year,
                Month = item.Key.Month,
                Label = new DateTime(item.Key.Year, item.Key.Month, 1).ToString("MMM yyyy"),
                DistanceKm = item.Value.Dist,
                FuelSpent = item.Value.Cost,
                AvgMileage = item.Value.Fuel > 0 ? Math.Round(item.Value.Dist / item.Value.Fuel, 2) : 0,
                CostPerKm = item.Value.Dist > 0 ? Math.Round(item.Value.Cost / item.Value.Dist, 2) : 0
            });
        }

        return summary;
    }

    // ───────────────────── Mappers ─────────────────────

    private static VehicleResponseDto MapVehicle(Vehicle v) => new()
    {
        Id = v.Id,
        Name = v.Name,
        VehicleType = v.VehicleType,
        FuelType = v.FuelType,
        RegistrationNumber = v.RegistrationNumber,
        ServiceIntervalKm = v.ServiceIntervalKm,
        CreatedAt = v.CreatedAt
    };

    private static FuelEntryResponseDto MapFuelEntry(FuelEntry entry, List<FuelEntry> sortedVehicleEntries)
    {
        decimal? distance = null;
        decimal? mileage = null;

        var idx = sortedVehicleEntries.FindIndex(e => e.Id == entry.Id);
        if (idx > 0)
        {
            distance = entry.OdometerReading - sortedVehicleEntries[idx - 1].OdometerReading;
            mileage = entry.FuelQuantity > 0 ? Math.Round(distance.Value / entry.FuelQuantity, 2) : null;
        }

        return new FuelEntryResponseDto
        {
            Id = entry.Id,
            VehicleId = entry.VehicleId,
            VehicleName = entry.Vehicle?.Name ?? "",
            Date = entry.Date,
            OdometerReading = entry.OdometerReading,
            FuelQuantity = entry.FuelQuantity,
            FuelCost = entry.FuelCost,
            PricePerLiter = entry.PricePerLiter ?? (entry.FuelQuantity > 0 ? entry.FuelCost / entry.FuelQuantity : 0),
            Notes = entry.Notes,
            DistanceKm = distance,
            Mileage = mileage
        };
    }
}
