using ExpenseTracker.DTOs.Reminder;

namespace ExpenseTracker.DTOs.Dashboard;

public class DashboardResponseDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal TotalInvestment { get; set; }
    public decimal CurrentBalance { get; set; }
    public int IncomeCount { get; set; }
    public int ExpenseCount { get; set; }
    public int TotalTransactionCount { get; set; }

    public List<MonthlySummaryDto> MonthlySummary { get; set; } = new();
    public List<YearlyTrendDto> YearlyTrend { get; set; } = new();
    public List<CategoryWiseSpendingDto> CategoryWiseSpending { get; set; } = new();
    public List<BankWiseSpendingDto> BankWiseSpending { get; set; } = new();
    public OnlineVsOfflineSummaryDto OnlineVsOfflineSummary { get; set; } = new();
    public List<BudgetVsActualDto> BudgetVsActual { get; set; } = new();
    public List<AccountSummaryDto> Accounts { get; set; } = new();
    public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    public List<ReminderDto> UpcomingReminders { get; set; } = new();
    public List<WeeklyTrendDto> WeeklyTrend { get; set; } = new();
    public List<DailyTrendDto> MonthlyTrend { get; set; } = new();
}

public class MonthlySummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Investment { get; set; }
    public decimal Net { get; set; }
}

public class YearlyTrendDto
{
    public int Year { get; set; }
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Investment { get; set; }
    public decimal Net { get; set; }
}

public class CategoryWiseSpendingDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal Percentage { get; set; }
    public string? Icon { get; set; }
}

public class BankWiseSpendingDto
{
    public string BankMode { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int TransactionCount { get; set; }
}

public class OnlineVsOfflineSummaryDto
{
    public decimal OnlineTotal { get; set; }
    public int OnlineCount { get; set; }
    public decimal OfflineTotal { get; set; }
    public int OfflineCount { get; set; }
}

public class BudgetVsActualDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal BudgetAmount { get; set; }
    public decimal ActualSpent { get; set; }
    public decimal Remaining { get; set; }
    public decimal UtilizationPercent { get; set; }
    public string? Icon { get; set; }
}

public class AccountSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}

public class RecentTransactionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Icon { get; set; }
}

public class WeeklyTrendDto
{
    public string Day { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
}

public class DailyTrendDto
{
    public int Day { get; set; }
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
}
