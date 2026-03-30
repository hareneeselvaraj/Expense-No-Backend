using ExpenseTracker.DTOs.Investment;

namespace ExpenseTracker.Services.Interfaces;

public interface IInvestmentService
{
    Task<InvestmentResponseDto> CreateAsync(Guid userId, CreateInvestmentDto dto);
    Task<IEnumerable<InvestmentResponseDto>> GetAllAsync(Guid userId);
    Task<InvestmentResponseDto?> GetByIdAsync(Guid userId, Guid id);
    Task<InvestmentResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateInvestmentDto dto);
    Task<bool> DeleteAsync(Guid userId, Guid id);

    Task<InvestmentResponseDto?> SellAsync(Guid userId, Guid id, SellInvestmentDto dto);
    Task<IEnumerable<AssetTransactionDto>> GetTransactionsAsync(Guid userId, Guid? investmentId = null);
}
