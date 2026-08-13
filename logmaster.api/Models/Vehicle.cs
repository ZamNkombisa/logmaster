namespace LogMaster.Api.Models;

public class Vehicle
{
    public int Id { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string? LicensePlate { get; set; }

    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}