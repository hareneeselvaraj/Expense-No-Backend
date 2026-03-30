using ExpenseTracker.DTOs.Dashboard;

namespace ExpenseTracker.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponseDto> GetDashboardAsync(Guid userId, int? month = null, int? year = null, Guid? accountId = null, string scope = "Combined");
}
