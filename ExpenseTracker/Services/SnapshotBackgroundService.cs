using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace ExpenseTracker.Services;

public class SnapshotBackgroundService : BackgroundService
{
    private readonly IServiceProvider _services;

    public SnapshotBackgroundService(IServiceProvider services)
    {
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var snapshotter = scope.ServiceProvider.GetRequiredService<SnapshotService>();
                
                await snapshotter.TakeSnapshotsAsync();
                Console.WriteLine($"[SnapshotBackgroundService] Daily portfolio snapshot captured completed at {DateTime.UtcNow}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SnapshotBackgroundService] Error: {ex.Message}");
            }

            // Sleep for 24 hours. A real production app might calculate time to midnight.
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
