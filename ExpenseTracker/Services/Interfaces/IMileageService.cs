using ExpenseTracker.DTOs.Mileage;

namespace ExpenseTracker.Services.Interfaces;

public interface IMileageService
{
    // Vehicles
    Task<VehicleResponseDto> CreateVehicleAsync(Guid userId, CreateVehicleDto dto);
    Task<IEnumerable<VehicleResponseDto>> GetVehiclesAsync(Guid userId);
    Task<VehicleResponseDto?> UpdateVehicleAsync(Guid userId, Guid id, UpdateVehicleDto dto);
    Task<bool> DeleteVehicleAsync(Guid userId, Guid id);

    // Fuel Entries
    Task<FuelEntryResponseDto> CreateFuelEntryAsync(Guid userId, CreateFuelEntryDto dto);
    Task<IEnumerable<FuelEntryResponseDto>> GetFuelEntriesAsync(Guid userId, Guid? vehicleId);
    Task<FuelEntryResponseDto?> UpdateFuelEntryAsync(Guid userId, Guid id, UpdateFuelEntryDto dto);
    Task<bool> DeleteFuelEntryAsync(Guid userId, Guid id);

    // Summary
    Task<MileageSummaryDto> GetMileageSummaryAsync(Guid userId);
}
