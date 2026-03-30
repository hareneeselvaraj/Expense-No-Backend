using ExpenseTracker.DTOs.Tag;

namespace ExpenseTracker.Services.Interfaces;

public interface ITagService
{
    Task<TagResponseDto> CreateAsync(Guid userId, CreateTagDto dto);
    Task<IEnumerable<TagResponseDto>> GetAllAsync(Guid userId);
    Task<TagDetailDto?> GetDetailAsync(Guid userId, Guid tagId);
    Task<bool> DeleteAsync(Guid userId, Guid id);
}
