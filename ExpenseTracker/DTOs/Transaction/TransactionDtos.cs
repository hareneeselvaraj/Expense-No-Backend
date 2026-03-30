using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Models;

namespace ExpenseTracker.DTOs.Transaction;

public class CreateTransactionDto
{
    [Required]
    public Guid AccountId { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    [Required]
    public OnlineOffline OnlineOffline { get; set; }

    public BankMode? BankMode { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime? Date { get; set; }

    public bool IsMonitor { get; set; }

    public bool IsAutoDebit { get; set; }

    public Guid? TransferAccountId { get; set; }

    public Guid? TagId { get; set; }

    public Guid? InvestmentId { get; set; }
}

public class UpdateTransactionDto
{
    public Guid? AccountId { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal? Amount { get; set; }
    public TransactionType? Type { get; set; }
    public OnlineOffline? OnlineOffline { get; set; }
    public BankMode? BankMode { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
    public DateTime? Date { get; set; }
    public bool? IsMonitor { get; set; }
    public bool? IsAutoDebit { get; set; }
    public Guid? TransferAccountId { get; set; }
    public Guid? TagId { get; set; }
    public Guid? InvestmentId { get; set; }
}

public class TransactionResponseDto
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string OnlineOffline { get; set; } = string.Empty;
    public string? BankMode { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public bool IsMonitor { get; set; }
    public bool IsAutoDebit { get; set; }
    public Guid? TransferAccountId { get; set; }
    public string? TransferAccountName { get; set; }
    public Guid? TagId { get; set; }
    public string? TagName { get; set; }
    public Guid? InvestmentId { get; set; }
    public string? InvestmentName { get; set; }
}
public class BulkDeleteDto
{
    [Required]
    public List<Guid> Ids { get; set; } = new();
}
