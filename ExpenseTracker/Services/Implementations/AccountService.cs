using ExpenseTracker.DTOs.Account;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Services.Implementations;

public class AccountService : IAccountService
{
    private readonly IAccountRepository _accountRepo;

    public AccountService(IAccountRepository accountRepo)
    {
        _accountRepo = accountRepo;
    }

    public async Task<AccountResponseDto> CreateAsync(Guid userId, CreateAccountDto dto)
    {
        var account = new Account
        {
            UserId = userId,
            Name = dto.Name,
            Type = dto.Type,
            Balance = dto.Balance,
            CreditLimit = dto.CreditLimit
        };

        await _accountRepo.AddAsync(account);
        return MapToDto(account);
    }

    public async Task<IEnumerable<AccountResponseDto>> GetAllAsync(Guid userId)
    {
        var accounts = await _accountRepo.GetByUserIdAsync(userId);
        return accounts.Select(MapToDto);
    }

    public async Task<AccountResponseDto?> GetByIdAsync(Guid userId, Guid id)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account == null || account.UserId != userId) return null;
        return MapToDto(account);
    }

    public async Task<AccountResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateAccountDto dto)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account == null || account.UserId != userId) return null;

        if (dto.Name != null) account.Name = dto.Name;
        if (dto.Type.HasValue) account.Type = dto.Type.Value;
        if (dto.Balance.HasValue) account.Balance = dto.Balance.Value;
        if (dto.CreditLimit.HasValue) account.CreditLimit = dto.CreditLimit.Value;

        await _accountRepo.UpdateAsync(account);
        return MapToDto(account);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account == null || account.UserId != userId) return false;

        await _accountRepo.DeleteAsync(account);
        return true;
    }

    private static AccountResponseDto MapToDto(Account a) => new()
    {
        Id = a.Id,
        Name = a.Name,
        Type = a.Type.ToString(),
        Balance = a.Balance,
        CreditLimit = a.CreditLimit
    };
}
