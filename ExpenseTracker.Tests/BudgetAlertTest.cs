using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Services.Implementations;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Tests;

/// <summary>
/// Tests the budget alert logic: does it correctly detect overspending
/// and call the email service?
/// </summary>
public class BudgetAlertTest
{
    [Fact]
    public async Task CreateTransaction_ExceedingBudget_ShouldTriggerEmail()
    {
        // ── Arrange: In-memory DB ──
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "BudgetAlertTest_" + Guid.NewGuid())
            .Options;

        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var accountId = Guid.NewGuid();

        using var context = new AppDbContext(options);

        // Seed user
        context.Users.Add(new User
        {
            Id = userId,
            Name = "TestUser",
            Email = "hareneeselvaraj1308@gmail.com",
            PasswordHash = "hash"
        });

        // Seed account
        context.Accounts.Add(new Account
        {
            Id = accountId,
            UserId = userId,
            Name = "TestBank",
            Type = AccountType.Bank,
            Balance = 100000
        });

        // Seed category
        context.Categories.Add(new Category
        {
            Id = categoryId,
            UserId = userId,
            Name = "Food",
            Type = CategoryType.Expense
        });

        // Seed budget: ₹500 for Feb 2026
        context.Budgets.Add(new Budget
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = categoryId,
            Amount = 500,
            Month = 2,
            Year = 2026
        });

        await context.SaveChangesAsync();

        // ── Mock email service to verify it gets called ──
        var mockEmail = new Mock<IEmailService>();
        mockEmail
            .Setup(x => x.SendBudgetAlertAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<decimal>(), It.IsAny<decimal>(),
                It.IsAny<int>(), It.IsAny<int>()))
            .Returns(Task.CompletedTask);

        // ── Create repositories ──
        var transactionRepo = new ExpenseTracker.Repositories.Implementations.TransactionRepository(context);
        var accountRepo = new ExpenseTracker.Repositories.Implementations.AccountRepository(context);
        var categoryRepo = new ExpenseTracker.Repositories.Implementations.CategoryRepository(context);

        var service = new TransactionService(
            transactionRepo,
            accountRepo,
            categoryRepo,
            mockEmail.Object,
            context,
            NullLogger<TransactionService>.Instance);

        // ── Act: Create a ₹600 expense (exceeds ₹500 budget) ──
        var dto = new ExpenseTracker.DTOs.Transaction.CreateTransactionDto
        {
            AccountId = accountId,
            CategoryId = categoryId,
            Amount = 600,
            Type = TransactionType.Expense,
            OnlineOffline = OnlineOffline.Offline,
            Date = new DateTime(2026, 2, 15), // Feb 2026
        };

        var result = await service.CreateAsync(userId, dto);

        // ── Assert: Email was called ──
        Assert.NotNull(result);
        Assert.Equal(600, result.Amount);

        mockEmail.Verify(x => x.SendBudgetAlertAsync(
            "hareneeselvaraj1308@gmail.com",
            "TestUser",
            "Food",
            500m,
            600m,
            2,
            2026
        ), Times.Once, "Email service should have been called when budget is exceeded");

        Console.WriteLine("[TEST] ✅ Budget alert correctly triggered for overspending!");
    }

    [Fact]
    public async Task CreateTransaction_WithinBudget_ShouldNotTriggerEmail()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "BudgetNoAlertTest_" + Guid.NewGuid())
            .Options;

        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var accountId = Guid.NewGuid();

        using var context = new AppDbContext(options);

        context.Users.Add(new User { Id = userId, Name = "User", Email = "test@test.com", PasswordHash = "h" });
        context.Accounts.Add(new Account { Id = accountId, UserId = userId, Name = "Bank", Type = AccountType.Bank, Balance = 100000 });
        context.Categories.Add(new Category { Id = categoryId, UserId = userId, Name = "Food", Type = CategoryType.Expense });
        context.Budgets.Add(new Budget { Id = Guid.NewGuid(), UserId = userId, CategoryId = categoryId, Amount = 5000, Month = 2, Year = 2026 });
        await context.SaveChangesAsync();

        var mockEmail = new Mock<IEmailService>();
        var transactionRepo = new ExpenseTracker.Repositories.Implementations.TransactionRepository(context);
        var accountRepo = new ExpenseTracker.Repositories.Implementations.AccountRepository(context);
        var categoryRepo = new ExpenseTracker.Repositories.Implementations.CategoryRepository(context);

        var service = new TransactionService(transactionRepo, accountRepo, categoryRepo, mockEmail.Object, context, NullLogger<TransactionService>.Instance);

        var dto = new ExpenseTracker.DTOs.Transaction.CreateTransactionDto
        {
            AccountId = accountId, CategoryId = categoryId, Amount = 100,
            Type = TransactionType.Expense, OnlineOffline = OnlineOffline.Offline,
            Date = new DateTime(2026, 2, 15),
        };

        await service.CreateAsync(userId, dto);

        // Should NOT have sent an email (₹100 < ₹5000 budget)
        mockEmail.Verify(x => x.SendBudgetAlertAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<decimal>(), It.IsAny<decimal>(),
            It.IsAny<int>(), It.IsAny<int>()
        ), Times.Never, "Email should NOT be sent when within budget");

        Console.WriteLine("[TEST] ✅ No alert for under-budget spending — correct!");
    }
}
