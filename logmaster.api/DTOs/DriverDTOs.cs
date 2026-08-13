namespace LogMaster.Api.DTOs;

public record DriverDto(int Id, string FullName, string LicenseNumber);

public record CreateDriverDto(string FullName, string LicenseNumber);

public record UpdateDriverDto(string FullName, string LicenseNumber);