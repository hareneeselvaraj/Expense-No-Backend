using ExpenseTracker.DTOs.Budget;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;
using ExpenseTracker.Data;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Services.Implementations;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepo;
    private readonly ITransactionRepository _transactionRepo;
    private readonly AppDbContext _context;
    private readonly ICoupleService _coupleService;

    public BudgetService(
        IBudgetRepository budgetRepo,
        ITransactionRepository transactionRepo,
        AppDbContext context,
        ICoupleService coupleService)
    {
        _budgetRepo = budgetRepo;
        _transactionRepo = transactionRepo;
        _context = context;
        _coupleService = coupleService;
    }

    public async Task<BudgetResponseDto> CreateAsync(Guid userId, CreateBudgetDto dto)
    {
        var budget = new Budget
        {
            UserId = userId,
            Year = dto.Year,
            Month = dto.Month,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            AlertSentAt = null // Fresh budget — allow alert to fire
        };

        await _budgetRepo.AddAsync(budget);

        var userIds = await _coupleService.GetUserScopeAsync(userId, "Combined");
        var budgets = await _context.Budgets.Include(b => b.Category).Where(b => userIds.Contains(b.UserId)).ToListAsync();
        var created = budgets.First(b => b.Id == budget.Id);
        return await MapToDtoAsync(userId, created, "Combined");
    }

    public async Task<IEnumerable<BudgetResponseDto>> GetAllAsync(Guid userId, string scope = "Combined")
    {
        var userIds = await _coupleService.GetUserScopeAsync(userId, scope);
        var budgets = await _context.Budgets.Include(b => b.Category).Where(b => userIds.Contains(b.UserId)).ToListAsync();
        
        var result = new List<BudgetResponseDto>();
        foreach (var b in budgets)
            result.Add(await MapToDtoAsync(userId, b, scope));
        return result;
    }

    public async Task<IEnumerable<BudgetResponseDto>> GetByMonthAsync(Guid userId, int year, int month, string scope = "Combined")
    {
        var userIds = await _coupleService.GetUserScopeAsync(userId, scope);
        var budgets = await _context.Budgets.Include(b => b.Category).Where(b => userIds.Contains(b.UserId) && b.Year == year && b.Month == month).ToListAsync();
        
        var result = new List<BudgetResponseDto>();
        foreach (var b in budgets)
            result.Add(await MapToDtoAsync(userId, b, scope));
        return result;
    }

    public async Task<BudgetResponseDto?> GetByIdAsync(Guid userId, Guid id)
    {
        var budget = await _budgetRepo.GetByIdAsync(id);
        if (budget == null) return null;

        var userIds = await _coupleService.GetUserScopeAsync(userId, "Combined");
        if (!userIds.Contains(budget.UserId)) return null;

        var budgets = await _context.Budgets.Include(b => b.Category).Where(b => userIds.Contains(b.UserId)).ToListAsync();
        var full = budgets.First(b => b.Id == id);
        return await MapToDtoAsync(userId, full, "Combined");
    }

    public async Task<BudgetResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateBudgetDto dto)
    {
        var budget = await _budgetRepo.GetByIdAsync(id);
        if (budget == null || budget.UserId != userId) return null;

        if (dto.Year.HasValue) budget.Year = dto.Year.Value;
        if (dto.Month.HasValue) budget.Month = dto.Month.Value;
        if (dto.CategoryId.HasValue) budget.CategoryId = dto.CategoryId.Value;
        if (dto.Amount.HasValue) budget.Amount = dto.Amount.Value;

        // Reset alert flag so a new alert can fire after budget changes
        budget.AlertSentAt = null;

        await _budgetRepo.UpdateAsync(budget);

        var userIds = await _coupleService.GetUserScopeAsync(userId, "Combined");
        var budgets = await _context.Budgets.Include(b => b.Category).Where(b => userIds.Contains(b.UserId)).ToListAsync();
        var updated = budgets.First(b => b.Id == id);
        return await MapToDtoAsync(userId, updated, "Combined");
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id)
    {
        var budget = await _budgetRepo.GetByIdAsync(id);
        if (budget == null || budget.UserId != userId) return false;

        await _budgetRepo.DeleteAsync(budget);
        return true;
    }

    private async Task<BudgetResponseDto> MapToDtoAsync(Guid userId, Budget b, string scope = "Combined")
    {
        var startDate = new DateTime(b.Year, b.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1).AddTicks(-1);

        var userIds = await _coupleService.GetUserScopeAsync(userId, scope);

        var txs = await _context.Transactions
            .Where(t => userIds.Contains(t.UserId) 
                     && t.Type == TransactionType.Expense 
                     && t.CategoryId == b.CategoryId 
                     && t.Date >= startDate 
                     && t.Date <= endDate)
            .ToListAsync();

        var spent = txs.Sum(t => t.Amount);
        var mySpent = txs.Where(t => t.UserId == userId).Sum(t => t.Amount);
        var partnerSpent = txs.Where(t => t.UserId != userId).Sum(t => t.Amount);

        return new BudgetResponseDto
        {
            Id = b.Id,
            Year = b.Year,
            Month = b.Month,
            CategoryId = b.CategoryId,
            CategoryName = b.Category?.Name ?? string.Empty,
            Amount = b.Amount,
            Spent = spent,
            MySpent = mySpent,
            PartnerSpent = partnerSpent,
            Remaining = b.Amount - spent
        };
    }
}
