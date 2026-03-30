using Microsoft.Extensions.Hosting;

namespace ExpenseTracker.Services;

public class BackupBackgroundService : BackgroundService
{
    private readonly BackupService _backupService;

    public BackupBackgroundService(BackupService backupService)
    {
        _backupService = backupService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _backupService.RunBackup();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BackupBackgroundService] Error: {ex.Message}");
            }

            // Run every 24 hours
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
