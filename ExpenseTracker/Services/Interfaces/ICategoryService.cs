using ExpenseTracker.DTOs.Category;

namespace ExpenseTracker.Services.Interfaces;

public interface ICategoryService
{
    Task<CategoryResponseDto> CreateAsync(Guid userId, CreateCategoryDto dto);
    Task<IEnumerable<CategoryResponseDto>> GetAllAsync(Guid userId);
    Task<CategoryResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateCategoryDto dto);
    Task<bool> DeleteAsync(Guid userId, Guid id);
}
