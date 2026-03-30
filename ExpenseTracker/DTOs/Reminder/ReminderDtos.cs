using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.DTOs.Reminder;

public class ReminderDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public decimal? Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = "Expense";
}

public class CreateReminderDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required]
    public DateTime Date { get; set; }
    public decimal? Amount { get; set; }
    public string Category { get; set; } = "General";
    public string Priority { get; set; } = "medium";
}
