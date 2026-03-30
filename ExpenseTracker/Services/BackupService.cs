using System.IO;

namespace ExpenseTracker.Services;

public class BackupService
{
    private readonly string _dbPath = "expense.db";
    private readonly string _backupDir = "backups";
    private readonly IConfiguration _configuration;

    public BackupService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void RunBackup()
    {
        // Skip file-based backup when using SQL Server (managed by the hosting provider)
        var provider = _configuration["DatabaseProvider"] ?? "Sqlite";
        if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            Console.WriteLine("[BackupService] Running on SQL Server — backup managed by hosting provider. Skipping.");
            return;
        }

        if (!Directory.Exists(_backupDir))
        {
            Directory.CreateDirectory(_backupDir);
        }

        string timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
        string destPath = Path.Combine(_backupDir, $"expense_backup_{timestamp}.db");

        if (File.Exists(_dbPath))
        {
            File.Copy(_dbPath, destPath, true);
            Console.WriteLine($"[BackupService] Database backed up to {destPath}");
            
            // Cleanup: Keep only last 30 backups
            var files = Directory.GetFiles(_backupDir, "expense_backup_*.db")
                                 .OrderByDescending(f => f)
                                 .Skip(30);
            foreach (var file in files)
            {
                File.Delete(file);
            }
        }
    }
}
