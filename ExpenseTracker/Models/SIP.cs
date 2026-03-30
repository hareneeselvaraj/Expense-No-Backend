using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class SIP
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid InvestmentId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyAmount { get; set; }

    /// <summary>Day of month to execute (1–28)</summary>
    [Required]
    public int ExecutionDay { get; set; } = 1;

    [MaxLength(20)]
    public string Status { get; set; } = "Active"; // "Active" | "Paused" | "Completed"

    public DateTime? NextExecutionDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;
}

public class SIPHistory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid SIPId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal? NavAtExecution { get; set; }

    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string Status { get; set; } = "Success"; // "Success" | "Failed"

    [MaxLength(500)]
    public string? Notes { get; set; }

    // Navigation
    [ForeignKey(nameof(SIPId))]
    public SIP SIP { get; set; } = null!;
}
