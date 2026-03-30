using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Models;

namespace ExpenseTracker.DTOs.Budget;

public class CreateBudgetDto
{
    [Required]
    public int Year { get; set; }

    [Required, Range(1, 12)]
    public int Month { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    public decimal Amount { get; set; }
}

public class UpdateBudgetDto
{
    public int? Year { get; set; }

    [Range(1, 12)]
    public int? Month { get; set; }

    public Guid? CategoryId { get; set; }
    public decimal? Amount { get; set; }
}

public class BudgetResponseDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Spent { get; set; }
    public decimal MySpent { get; set; }
    public decimal PartnerSpent { get; set; }
    public decimal Remaining { get; set; }
}
