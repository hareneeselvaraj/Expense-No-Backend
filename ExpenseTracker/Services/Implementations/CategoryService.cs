using ExpenseTracker.DTOs.Category;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepo;

    public CategoryService(ICategoryRepository categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }

    public async Task<CategoryResponseDto> CreateAsync(Guid userId, CreateCategoryDto dto)
    {
        var category = new Category
        {
            UserId = userId,
            Name = dto.Name,
            Type = dto.Type,
            Icon = dto.Icon
        };

        await _categoryRepo.AddAsync(category);
        return MapToDto(category);
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync(Guid userId)
    {
        var categories = await _categoryRepo.GetByUserIdAsync(userId);
        return categories.Select(MapToDto);
    }

    public async Task<CategoryResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateCategoryDto dto)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null || category.UserId != userId) return null;

        if (!string.IsNullOrWhiteSpace(dto.Name)) category.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Type) &&
            Enum.TryParse<CategoryType>(dto.Type, true, out var parsed))
            category.Type = parsed;
        if (dto.Icon != null) category.Icon = dto.Icon == "" ? null : dto.Icon;

        await _categoryRepo.UpdateAsync(category);
        return MapToDto(category);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null || category.UserId != userId) return false;

        await _categoryRepo.DeleteAsync(category);
        return true;
    }

    private static CategoryResponseDto MapToDto(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Type = c.Type.ToString(),
        Icon = c.Icon
    };
}
