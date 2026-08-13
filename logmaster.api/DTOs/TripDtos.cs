namespace LogMaster.Api.DTOs;

public record TripDto(
    int Id,
    int DriverId,
    string DriverName,
    int VehicleId,
    string VehicleNumber,
    string ShipperName,
    string LoadNumber,
    double DistanceMiles,
    double AverageSpeedMph,
    DateTime StartTime,
    DateTime? EndTime,
    bool HasViolations,
    double? OriginLat = null,
    double? OriginLng = null,
    double? DestinationLat = null,
    double? DestinationLng = null
);

public record CreateTripDto(
    int DriverId,
    int VehicleId,
    string ShipperName,
    string LoadNumber,
    double DistanceMiles,
    double AverageSpeedMph,
    DateTime StartTime,
    double? OriginLat = null,
    double? OriginLng = null,
    double? DestinationLat = null,
    double? DestinationLng = null
);