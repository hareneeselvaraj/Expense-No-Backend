using ExpenseTracker.DTOs.Transaction;
using ExpenseTracker.Models;

namespace ExpenseTracker.Services.Interfaces;

/// <summary>Diagnostic result returned by TestBudgetCheckAsync.</summary>
public class BudgetCheckResultDto
{
    public bool BudgetFound { get; set; }
    public Guid? BudgetId { get; set; }
    public decimal BudgetAmount { get; set; }
    public decimal TotalSpent { get; set; }
    public bool Exceeded { get; set; }
    public bool EmailSent { get; set; }
    public string? Error { get; set; }
}

public interface ITransactionService
{
    Task<TransactionResponseDto> CreateAsync(Guid userId, CreateTransactionDto dto);
    Task<IEnumerable<TransactionResponseDto>> GetAllAsync(Guid userId);
    Task<IEnumerable<TransactionResponseDto>> GetFilteredAsync(
        Guid userId, DateTime? startDate, DateTime? endDate,
        TransactionType? type, Guid? categoryId, Guid? accountId);
    Task<TransactionResponseDto?> GetByIdAsync(Guid userId, Guid id);
    Task<TransactionResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateTransactionDto dto);
    Task<bool> DeleteAsync(Guid userId, Guid id);
    Task<int> DeleteBulkAsync(Guid userId, IEnumerable<Guid> ids);

    /// <summary>Bulk upload transactions from a stream (Excel/PDF).</summary>
    Task<int> UploadAsync(Guid userId, Guid accountId, Stream fileStream, string fileName);

    /// <summary>Generate a preview of parsed transactions from an upload stream without saving.</summary>
    Task<IEnumerable<TransactionResponseDto>> UploadPreviewAsync(Guid userId, Guid accountId, Stream fileStream, string fileName);

    /// <summary>Commit a pre-reviewed list of transactions to the database.</summary>
    Task<int> UploadCommitAsync(Guid userId, IEnumerable<TransactionResponseDto> dtos);

    /// <summary>Manually trigger a budget check for diagnostics.</summary>
    Task<BudgetCheckResultDto> TestBudgetCheckAsync(Guid userId, Guid categoryId);
}
