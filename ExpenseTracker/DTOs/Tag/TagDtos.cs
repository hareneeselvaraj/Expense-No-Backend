namespace ExpenseTracker.DTOs.Tag;

public class CreateTagDto
{
    public string Name { get; set; } = string.Empty;
}

public class TagResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TransactionCount { get; set; }
}

public class TagDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int TransactionCount { get; set; }
    public List<TagTransactionDto> Transactions { get; set; } = new();
}

public class TagTransactionDto
{
    public Guid Id { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
}
