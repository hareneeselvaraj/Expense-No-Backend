using ExpenseTracker.Services.Implementations;

namespace ExpenseTracker.Services;

/// <summary>Background service that checks and executes due SIPs every hour</summary>
public class SIPBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SIPBackgroundService> _logger;

    public SIPBackgroundService(IServiceProvider serviceProvider, ILogger<SIPBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[SIP] Background service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var sipService = scope.ServiceProvider.GetRequiredService<SIPService>();
                var count = await sipService.ExecuteDueSIPsAsync();

                if (count > 0)
                    _logger.LogInformation("[SIP] Auto-executed {Count} due SIPs", count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SIP] Background execution failed");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
