namespace LogMaster.Api.Models;

public enum DutyStatus
{
    OffDuty,
    SleeperBerth,
    Driving,
    OnDutyNotDriving
}

public class LogEntry
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public DutyStatus Status { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAuto { get; set; } = false;
}