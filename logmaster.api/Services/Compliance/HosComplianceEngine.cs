using LogMaster.Api.Models;

namespace LogMaster.Api.Services.Compliance;

public class HosComplianceEngine : IHosComplianceEngine
{
    public IReadOnlyList<ComplianceFlag> Evaluate(Trip trip, Trip? previousTrip)
    {
        var flags = new List<ComplianceFlag>();
        var entries = trip.LogEntries.OrderBy(e => e.StartTime).ToList();

        if (entries.Count == 0) return flags;

        CheckTenHourReset(trip, previousTrip, flags);
        CheckElevenHourDrivingLimit(trip, entries, flags);
        CheckFourteenHourWindow(trip, entries, flags);
        CheckThirtyMinuteBreakRule(trip, entries, flags);

        return flags;
    }

    private static void CheckTenHourReset(Trip trip, Trip? previousTrip, List<ComplianceFlag> flags)
    {
        if (previousTrip is null) return;

        var lastEntry = previousTrip.LogEntries.OrderByDescending(e => e.EndTime).FirstOrDefault();
        if (lastEntry is null) return;

        var restHours = (trip.StartTime - lastEntry.EndTime).TotalHours;

        if (restHours < HosConstants.MinimumOffDutyResetHours)
        {
            flags.Add(new ComplianceFlag
            {
                TripId = trip.Id,
                RuleCode = "HOS-10HR-RESET",
                Description = $"Only {restHours:F1} hours off duty before this trip started; minimum required is {HosConstants.MinimumOffDutyResetHours} hours.",
                Severity = FlagSeverity.Violation,
                DetectedAt = DateTime.UtcNow
            });
        }
    }

    private static void CheckElevenHourDrivingLimit(Trip trip, List<LogEntry> entries, List<ComplianceFlag> flags)
    {
        var totalDrivingMinutes = entries
            .Where(e => e.Status == DutyStatus.Driving)
            .Sum(e => (e.EndTime - e.StartTime).TotalMinutes);

        var totalDrivingHours = totalDrivingMinutes / 60.0;

        if (totalDrivingHours > HosConstants.MaxDrivingHours)
        {
            flags.Add(new ComplianceFlag
            {
                TripId = trip.Id,
                RuleCode = "HOS-11HR-DRIVING",
                Description = $"Total driving time is {totalDrivingHours:F1} hours, exceeding the {HosConstants.MaxDrivingHours}-hour daily limit.",
                Severity = FlagSeverity.Violation,
                DetectedAt = DateTime.UtcNow
            });
        }
    }

    private static void CheckFourteenHourWindow(Trip trip, List<LogEntry> entries, List<ComplianceFlag> flags)
    {
        var onDutyEntries = entries.Where(e => e.Status != DutyStatus.OffDuty).ToList();
        if (onDutyEntries.Count == 0) return;

        var windowStart = onDutyEntries.Min(e => e.StartTime);
        var windowEnd = entries.Max(e => e.EndTime);
        var windowHours = (windowEnd - windowStart).TotalHours;

        if (windowHours > HosConstants.MaxOnDutyWindowHours)
        {
            flags.Add(new ComplianceFlag
            {
                TripId = trip.Id,
                RuleCode = "HOS-14HR-WINDOW",
                Description = $"On-duty window is {windowHours:F1} hours, exceeding the {HosConstants.MaxOnDutyWindowHours}-hour limit.",
                Severity = FlagSeverity.Violation,
                DetectedAt = DateTime.UtcNow
            });
        }
    }

    private static void CheckThirtyMinuteBreakRule(Trip trip, List<LogEntry> entries, List<ComplianceFlag> flags)
    {
        double drivingMinutesSinceBreak = 0;
        var alreadyFlagged = false;

        foreach (var entry in entries)
        {
            var durationMinutes = (entry.EndTime - entry.StartTime).TotalMinutes;

            if (entry.Status == DutyStatus.Driving)
            {
                drivingMinutesSinceBreak += durationMinutes;

                if (!alreadyFlagged && drivingMinutesSinceBreak > HosConstants.RequiredBreakAfterDrivingHours * 60)
                {
                    flags.Add(new ComplianceFlag
                    {
                        TripId = trip.Id,
                        RuleCode = "HOS-8HR-BREAK",
                        Description = $"Drove more than {HosConstants.RequiredBreakAfterDrivingHours} hours without a qualifying {HosConstants.MinimumBreakMinutes}-minute break.",
                        Severity = FlagSeverity.Violation,
                        DetectedAt = DateTime.UtcNow
                    });
                    alreadyFlagged = true;
                }
            }
            else if (entry.Status is DutyStatus.OffDuty or DutyStatus.SleeperBerth
                     && durationMinutes >= HosConstants.MinimumBreakMinutes)
            {
                drivingMinutesSinceBreak = 0;
                alreadyFlagged = false;
            }
        }
    }
}