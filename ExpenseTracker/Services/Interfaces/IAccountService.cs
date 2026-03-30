using ExpenseTracker.DTOs.Account;

namespace ExpenseTracker.Services.Interfaces;

public interface IAccountService
{
    Task<AccountResponseDto> CreateAsync(Guid userId, CreateAccountDto dto);
    Task<IEnumerable<AccountResponseDto>> GetAllAsync(Guid userId);
    Task<AccountResponseDto?> GetByIdAsync(Guid userId, Guid id);
    Task<AccountResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateAccountDto dto);
    Task<bool> DeleteAsync(Guid userId, Guid id);
}
