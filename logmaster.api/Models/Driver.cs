namespace LogMaster.Api.Models;

public class Driver
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string? UserId { get; set; } // links to ASP.NET Identity user, added later

    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}