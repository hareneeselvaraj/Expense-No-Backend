using ExpenseTracker.Models;

namespace ExpenseTracker.Repositories.Interfaces;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Transaction>> GetByUserIdFilteredAsync(
        Guid userId, DateTime? startDate, DateTime? endDate,
        TransactionType? type, Guid? categoryId, Guid? accountId);
    Task<Transaction?> GetByIdWithDetailsAsync(Guid id);
}

public interface IAccountRepository : IRepository<Account>
{
    Task<IEnumerable<Account>> GetByUserIdAsync(Guid userId);
}

public interface ICategoryRepository : IRepository<Category>
{
    Task<IEnumerable<Category>> GetByUserIdAsync(Guid userId);
}

public interface IBudgetRepository : IRepository<Budget>
{
    Task<IEnumerable<Budget>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Budget>> GetByUserIdAndMonthAsync(Guid userId, int year, int month);
}

public interface IInvestmentRepository : IRepository<Investment>
{
    Task<IEnumerable<Investment>> GetByUserIdAsync(Guid userId);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
}

public interface IVehicleRepository : IRepository<Vehicle>
{
    Task<IEnumerable<Vehicle>> GetByUserIdAsync(Guid userId);
}

public interface IFuelEntryRepository : IRepository<FuelEntry>
{
    Task<IEnumerable<FuelEntry>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<FuelEntry>> GetByVehicleIdAsync(Guid vehicleId);
}
