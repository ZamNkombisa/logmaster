using System.Security.Claims;
using LogMaster.Api.Data.Repositories;
using LogMaster.Api.DTOs;
using LogMaster.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace LogMaster.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly ITripRepository _tripRepository;
    private readonly IRepository<ComplianceFlag> _flagRepository;
    private readonly IRepository<Driver> _driverRepository;
    private readonly IRepository<Vehicle> _vehicleRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IDriverService _driverService;

    public DashboardService(
        ITripRepository tripRepository,
        IRepository<ComplianceFlag> flagRepository,
        IRepository<Driver> driverRepository,
        IRepository<Vehicle> vehicleRepository,
        UserManager<ApplicationUser> userManager,
        IDriverService driverService)
    {
        _tripRepository = tripRepository;
        _flagRepository = flagRepository;
        _driverRepository = driverRepository;
        _vehicleRepository = vehicleRepository;
        _userManager = userManager;
        _driverService = driverService;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(ClaimsPrincipal principal)
    {
        var isPrivileged = principal.IsInRole("Admin") || principal.IsInRole("Dispatcher");

        int? driverIdFilter = null;
        if (!isPrivileged)
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var driver = userId is null ? null : await _driverService.GetByUserIdAsync(userId);
            driverIdFilter = driver?.Id ?? -1;
        }

        var allTrips = await _tripRepository.GetAllAsync();
        var relevantTrips = driverIdFilter.HasValue
            ? allTrips.Where(t => t.DriverId == driverIdFilter.Value)
            : allTrips;

        var activeTrips = relevantTrips.Where(t => t.EndTime == null).ToList();

        var allFlags = await _flagRepository.GetAllAsync();
        var activeTripIds = activeTrips.Select(t => t.Id).ToHashSet();
        var flaggedActiveTrips = allFlags
            .Where(f => f.Severity == FlagSeverity.Violation && activeTripIds.Contains(f.TripId))
            .Select(f => f.TripId)
            .Distinct()
            .Count();

        if (!isPrivileged)
        {
            return new DashboardSummaryDto(
                activeTrips.Count, flaggedActiveTrips, null, null, null, null, null
            );
        }

        var driversOnDuty = activeTrips.Select(t => t.DriverId).Distinct().Count();
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var violations30d = allFlags.Count(f => f.Severity == FlagSeverity.Violation && f.DetectedAt >= thirtyDaysAgo);

        int? totalUsers = principal.IsInRole("Admin") ? _userManager.Users.Count() : null;
        var totalDrivers = (await _driverRepository.GetAllAsync()).Count();
        var totalVehicles = (await _vehicleRepository.GetAllAsync()).Count();

        return new DashboardSummaryDto(
            activeTrips.Count, flaggedActiveTrips, driversOnDuty,
            totalUsers, totalDrivers, totalVehicles, violations30d
        );
    }
}