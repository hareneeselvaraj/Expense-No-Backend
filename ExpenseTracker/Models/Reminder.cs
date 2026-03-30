using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Models;

public class Reminder
{
    public Guid Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public decimal? Amount { get; set; }

    public string Category { get; set; } = "General";

    public string Priority { get; set; } = "medium"; // low, medium, high

    public string Status { get; set; } = "upcoming"; // upcoming, completed

    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
}
