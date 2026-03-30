using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Models;

namespace ExpenseTracker.DTOs.Account;

public class CreateAccountDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public AccountType Type { get; set; }

    public decimal Balance { get; set; }
    public decimal? CreditLimit { get; set; }
}

public class UpdateAccountDto
{
    [MaxLength(100)]
    public string? Name { get; set; }
    public AccountType? Type { get; set; }
    public decimal? Balance { get; set; }
    public decimal? CreditLimit { get; set; }
}

public class AccountResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public decimal? CreditLimit { get; set; }
}
