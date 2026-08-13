namespace LogMaster.Api.DTOs;

public record DashboardSummaryDto(
    int ActiveTrips,
    int FlaggedTrips,
    int? DriversOnDuty,
    int? TotalUsers,
    int? TotalDrivers,
    int? TotalVehicles,
    int? ViolationsLast30Days
);