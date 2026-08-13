using LogMaster.Api.Data;
using LogMaster.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogMaster.Api.Services;

public class AutoDutyStatusService : BackgroundService
{
    private readonly IServiceProvider _services;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    public AutoDutyStatusService(IServiceProvider services)
    {
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await TickAsync();
            }
            catch
            {
                // In production this would log via ILogger; swallowing here keeps the loop alive on transient DB errors
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task TickAsync()
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var now = DateTime.UtcNow;

        var activeTrips = await db.Trips.Where(t => t.EndTime == null).ToListAsync();

        foreach (var trip in activeTrips)
        {
            var lastEntry = await db.LogEntries
                .Where(l => l.TripId == trip.Id)
                .OrderByDescending(l => l.EndTime)
                .FirstOrDefaultAsync();

            if (lastEntry is null || lastEntry.EndTime >= now) continue;

            if (lastEntry.IsAuto)
            {
                // Keep extending the same auto-entry forward rather than spawning many tiny rows
                lastEntry.EndTime = now;
            }
            else
            {
                db.LogEntries.Add(new LogEntry
                {
                    TripId = trip.Id,
                    Status = DutyStatus.Driving,
                    StartTime = lastEntry.EndTime,
                    EndTime = now,
                    IsAuto = true
                });
            }
        }

        await db.SaveChangesAsync();
    }
}