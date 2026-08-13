namespace LogMaster.Api.Models;

public class Trip
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public Driver Driver { get; set; } = null!;

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    public string ShipperName { get; set; } = string.Empty;
    public string LoadNumber { get; set; } = string.Empty;
    public double DistanceMiles { get; set; }
    public double AverageSpeedMph { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    public ICollection<LogEntry> LogEntries { get; set; } = new List<LogEntry>();
    public ICollection<ComplianceFlag> ComplianceFlags { get; set; } = new List<ComplianceFlag>();
    public double? OriginLat { get; set; }
    public double? OriginLng { get; set; }
    public double? DestinationLat { get; set; }
    public double? DestinationLng { get; set; }
}