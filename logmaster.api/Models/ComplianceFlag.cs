namespace LogMaster.Api.Models;

public enum FlagSeverity
{
    Info,
    Warning,
    Violation
}

public class ComplianceFlag
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;

    public string RuleCode { get; set; } = string.Empty;   // e.g. "HOS-11HR-DRIVING"
    public string Description { get; set; } = string.Empty;
    public FlagSeverity Severity { get; set; }
    public DateTime DetectedAt { get; set; }
}