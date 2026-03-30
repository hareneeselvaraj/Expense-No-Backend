using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;

namespace ExpenseTracker.Repositories.Implementations;

public class TransactionRepository : Repository<Transaction>, ITransactionRepository
{
    public TransactionRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId)
        => await _dbSet
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Include(t => t.TransferAccount)
            .Include(t => t.Tag)
            .Include(t => t.Investment)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

    public async Task<IEnumerable<Transaction>> GetByUserIdFilteredAsync(
        Guid userId, DateTime? startDate, DateTime? endDate,
        TransactionType? type, Guid? categoryId, Guid? accountId)
    {
        var query = _dbSet
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Include(t => t.TransferAccount)
            .Include(t => t.Tag)
            .Include(t => t.Investment)
            .Where(t => t.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(t => t.Date >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(t => t.Date <= endDate.Value);
        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);
        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);
        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value);

        return await query.OrderByDescending(t => t.Date).ToListAsync();
    }

    public async Task<Transaction?> GetByIdWithDetailsAsync(Guid id)
        => await _dbSet
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Include(t => t.TransferAccount)
            .Include(t => t.Tag)
            .Include(t => t.Investment)
            .FirstOrDefaultAsync(t => t.Id == id);
}

public class AccountRepository : Repository<Account>, IAccountRepository
{
    public AccountRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Account>> GetByUserIdAsync(Guid userId)
        => await _dbSet.Where(a => a.UserId == userId).ToListAsync();
}

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Category>> GetByUserIdAsync(Guid userId)
        => await _dbSet.Where(c => c.UserId == userId).ToListAsync();
}

public class BudgetRepository : Repository<Budget>, IBudgetRepository
{
    public BudgetRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Budget>> GetByUserIdAsync(Guid userId)
        => await _dbSet
            .Include(b => b.Category)
            .Where(b => b.UserId == userId)
            .ToListAsync();

    public async Task<IEnumerable<Budget>> GetByUserIdAndMonthAsync(Guid userId, int year, int month)
        => await _dbSet
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Year == year && b.Month == month)
            .ToListAsync();
}

public class InvestmentRepository : Repository<Investment>, IInvestmentRepository
{
    public InvestmentRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Investment>> GetByUserIdAsync(Guid userId)
        => await _dbSet.Where(i => i.UserId == userId).ToListAsync();
}

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
        => await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
}

public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
{
    public VehicleRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Vehicle>> GetByUserIdAsync(Guid userId)
        => await _dbSet.Where(v => v.UserId == userId)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
}

public class FuelEntryRepository : Repository<FuelEntry>, IFuelEntryRepository
{
    public FuelEntryRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<FuelEntry>> GetByUserIdAsync(Guid userId)
        => await _dbSet
            .Include(f => f.Vehicle)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.Date)
            .ToListAsync();

    public async Task<IEnumerable<FuelEntry>> GetByVehicleIdAsync(Guid vehicleId)
        => await _dbSet
            .Include(f => f.Vehicle)
            .Where(f => f.VehicleId == vehicleId)
            .OrderByDescending(f => f.Date)
            .ToListAsync();
}
