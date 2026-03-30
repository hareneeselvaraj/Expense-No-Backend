using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class Transaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid AccountId { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    public Guid? TagId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    [Required]
    public OnlineOffline OnlineOffline { get; set; }

    public BankMode? BankMode { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public bool IsMonitor { get; set; }

    public bool IsAutoDebit { get; set; }

    public Guid? TransferAccountId { get; set; }

    public Guid? InvestmentId { get; set; }

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(AccountId))]
    public Account Account { get; set; } = null!;

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    [ForeignKey(nameof(TransferAccountId))]
    public Account? TransferAccount { get; set; }

    [ForeignKey(nameof(TagId))]
    public Tag? Tag { get; set; }

    [ForeignKey(nameof(InvestmentId))]
    public Investment? Investment { get; set; }
}
