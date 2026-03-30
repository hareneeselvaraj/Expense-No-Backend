using ExpenseTracker.DTOs.Budget;

namespace ExpenseTracker.Services.Interfaces;

public interface IBudgetService
{
    Task<BudgetResponseDto> CreateAsync(Guid userId, CreateBudgetDto dto);
    Task<IEnumerable<BudgetResponseDto>> GetAllAsync(Guid userId, string scope = "Combined");
    Task<IEnumerable<BudgetResponseDto>> GetByMonthAsync(Guid userId, int year, int month, string scope = "Combined");
    Task<BudgetResponseDto?> GetByIdAsync(Guid userId, Guid id);
    Task<BudgetResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateBudgetDto dto);
    Task<bool> DeleteAsync(Guid userId, Guid id);
}
