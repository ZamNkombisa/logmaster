namespace LogMaster.Api.DTOs;

public record VehicleDto(int Id, string VehicleNumber, string? LicensePlate);

public record CreateVehicleDto(string VehicleNumber, string? LicensePlate);

public record UpdateVehicleDto(string VehicleNumber, string? LicensePlate);