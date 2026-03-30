using ExpenseTracker.DTOs.AIFeatures;

namespace ExpenseTracker.Services.Interfaces;

public interface IAIFeaturesService
{
    Task<AIBudgetResponseDto> GenerateBudgetAsync(Guid userId, AIBudgetRequestDto request);
    Task<int> ApplyBudgetsAsync(Guid userId, AIBudgetApplyDto dto);
    Task<FuelCoachResponseDto> GetFuelCoachAsync(Guid userId);
}
