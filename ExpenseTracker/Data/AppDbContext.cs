using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Models;

namespace ExpenseTracker.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<Investment> Investments => Set<Investment>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<FuelEntry> FuelEntries => Set<FuelEntry>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<Couple> Couples => Set<Couple>();
    public DbSet<SIP> SIPs => Set<SIP>();
    public DbSet<SIPHistory> SIPHistories => Set<SIPHistory>();
    public DbSet<AssetTransaction> AssetTransactions => Set<AssetTransaction>();
    public DbSet<PriceCache> PriceCaches => Set<PriceCache>();
    public DbSet<PortfolioSnapshot> PortfolioSnapshots => Set<PortfolioSnapshot>();
    public DbSet<Dividend> Dividends => Set<Dividend>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ── Account ──
        modelBuilder.Entity<Account>(e =>
        {
            e.HasOne(a => a.User)
             .WithMany(u => u.Accounts)
             .HasForeignKey(a => a.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(a => a.Type)
             .HasConversion<string>()
             .HasMaxLength(20);
        });

        // ── Category ──
        modelBuilder.Entity<Category>(e =>
        {
            e.HasOne(c => c.User)
             .WithMany(u => u.Categories)
             .HasForeignKey(c => c.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(c => c.Type)
             .HasConversion<string>()
             .HasMaxLength(20);
        });

        // ── Tag ──
        modelBuilder.Entity<Tag>(e =>
        {
            e.HasOne(t => t.User)
             .WithMany(u => u.Tags)
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Transaction ──
        modelBuilder.Entity<Transaction>(e =>
        {
            e.HasOne(t => t.User)
             .WithMany(u => u.Transactions)
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(t => t.Account)
             .WithMany(a => a.Transactions)
             .HasForeignKey(t => t.AccountId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(t => t.Category)
             .WithMany(c => c.Transactions)
             .HasForeignKey(t => t.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(t => t.TransferAccount)
             .WithMany()
             .HasForeignKey(t => t.TransferAccountId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);

            e.HasOne(t => t.Tag)
             .WithMany()
             .HasForeignKey(t => t.TagId)
             .OnDelete(DeleteBehavior.SetNull)
             .IsRequired(false);

            e.Property(t => t.Type)
             .HasConversion<string>()
             .HasMaxLength(20);

            e.Property(t => t.OnlineOffline)
             .HasConversion<string>()
             .HasMaxLength(10);

            e.Property(t => t.BankMode)
             .HasConversion<string>()
             .HasMaxLength(20);
        });

        // ── Budget ──
        modelBuilder.Entity<Budget>(e =>
        {
            e.HasOne(b => b.User)
             .WithMany(u => u.Budgets)
             .HasForeignKey(b => b.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(b => b.Category)
             .WithMany(c => c.Budgets)
             .HasForeignKey(b => b.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Investment ──
        modelBuilder.Entity<Investment>(e =>
        {
            e.HasOne(i => i.User)
             .WithMany(u => u.Investments)
             .HasForeignKey(i => i.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Vehicle ──
        modelBuilder.Entity<Vehicle>(e =>
        {
            e.HasOne(v => v.User)
             .WithMany(u => u.Vehicles)
             .HasForeignKey(v => v.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── FuelEntry ──
        modelBuilder.Entity<FuelEntry>(e =>
        {
            e.HasOne(f => f.User)
             .WithMany(u => u.FuelEntries)
             .HasForeignKey(f => f.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(f => f.Vehicle)
             .WithMany(v => v.FuelEntries)
             .HasForeignKey(f => f.VehicleId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Reminder ──
        modelBuilder.Entity<Reminder>(e =>
        {
            e.HasOne(r => r.User)
             .WithMany()
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Couple ──
        modelBuilder.Entity<Couple>(e =>
        {
            e.HasOne(c => c.Owner)
             .WithMany()
             .HasForeignKey(c => c.OwnerId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.Partner)
             .WithMany()
             .HasForeignKey(c => c.PartnerId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(c => c.InviteCode)
             .IsUnique();

            e.Property(c => c.Status)
             .HasConversion<string>()
             .HasMaxLength(20);
        });
    }
}
