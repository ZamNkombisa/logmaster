using LogMaster.Api.Data.Repositories;
using LogMaster.Api.DTOs;
using LogMaster.Api.Models;

namespace LogMaster.Api.Services;

public class TripService : ITripService
{
    private readonly ITripRepository _tripRepository;
    private readonly IRepository<Driver> _driverRepository;
    private readonly IRepository<Vehicle> _vehicleRepository;
    private readonly IRepository<LogEntry> _logEntryRepository;
    private readonly IRepository<ComplianceFlag> _flagRepository;

    public TripService(
        ITripRepository tripRepository,
        IRepository<Driver> driverRepository,
        IRepository<Vehicle> vehicleRepository,
        IRepository<LogEntry> logEntryRepository,
        IRepository<ComplianceFlag> flagRepository)
    {
        _tripRepository = tripRepository;
        _driverRepository = driverRepository;
        _vehicleRepository = vehicleRepository;
        _logEntryRepository = logEntryRepository;
        _flagRepository = flagRepository;
    }

    public async Task<IEnumerable<TripDto>> GetAllAsync(int? driverIdFilter = null)
    {
        var trips = driverIdFilter.HasValue
            ? await _tripRepository.GetAllWithDetailsAsync(driverIdFilter.Value)
            : await _tripRepository.GetAllWithDetailsAsync();

        var violationFlags = await _flagRepository.FindAllAsync(f => f.Severity == FlagSeverity.Violation);
        var flaggedTripIds = violationFlags.Select(f => f.TripId).ToHashSet();

        return trips.Select(t => ToDto(t, flaggedTripIds.Contains(t.Id)));
    }

    public async Task<TripDto?> GetByIdAsync(int id)
    {
        var trip = await _tripRepository.GetByIdAsync(id);
        return trip is null ? null : ToDto(trip);
    }

    public async Task<(TripDto? Trip, string? Error)> CreateAsync(CreateTripDto dto)
    {
        var driver = await _driverRepository.GetByIdAsync(dto.DriverId);
        if (driver is null)
            return (null, $"Driver with id {dto.DriverId} does not exist.");

        var vehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId);
        if (vehicle is null)
            return (null, $"Vehicle with id {dto.VehicleId} does not exist.");

        var trip = new Trip
        {
            DriverId = dto.DriverId,
            VehicleId = dto.VehicleId,
            ShipperName = dto.ShipperName,
            LoadNumber = dto.LoadNumber,
            DistanceMiles = dto.DistanceMiles,
            AverageSpeedMph = dto.AverageSpeedMph,
            StartTime = dto.StartTime,
            OriginLat = dto.OriginLat,
            OriginLng = dto.OriginLng,
            DestinationLat = dto.DestinationLat,
            DestinationLng = dto.DestinationLng
        };

        await _tripRepository.AddAsync(trip);
        await _tripRepository.SaveChangesAsync();

        trip.Driver = driver;
        trip.Vehicle = vehicle;

        return (ToDto(trip), null);
    }

    public async Task<(LogEntryDto? LogEntry, string? Error)> AddLogEntryAsync(int tripId, CreateLogEntryDto dto)
    {
        var trip = await _tripRepository.GetByIdAsync(tripId);
        if (trip is null)
            return (null, $"Trip with id {tripId} does not exist.");

        if (dto.EndTime <= dto.StartTime)
            return (null, "EndTime must be after StartTime.");

        // A driver's real entry supersedes any auto-filled gap it overlaps
        var staleAuto = (await _logEntryRepository.FindAllAsync(l => l.TripId == tripId && l.IsAuto))
            .Where(l => l.EndTime > dto.StartTime);
        foreach (var stale in staleAuto) _logEntryRepository.Remove(stale);

        var logEntry = new LogEntry
        {
            TripId = tripId,
            Status = dto.Status,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsAuto = false
        };

        await _logEntryRepository.AddAsync(logEntry);
        await _logEntryRepository.SaveChangesAsync();

        return (new LogEntryDto(logEntry.Id, logEntry.Status.ToString(), logEntry.StartTime, logEntry.EndTime, logEntry.IsAuto), null);
    }

    public async Task<IEnumerable<LogEntryDto>> GetLogEntriesAsync(int tripId)
    {
        var entries = await _logEntryRepository.FindAllAsync(l => l.TripId == tripId);
        return entries
            .OrderBy(e => e.StartTime)
            .Select(e => new LogEntryDto(e.Id, e.Status.ToString(), e.StartTime, e.EndTime, e.IsAuto));
    }

    public async Task<bool> CompleteAsync(int id)
    {
        var trip = await _tripRepository.GetByIdAsync(id);
        if (trip is null) return false;

        trip.EndTime = DateTime.UtcNow;
        _tripRepository.Update(trip);
        return await _tripRepository.SaveChangesAsync();
    }

    private static TripDto ToDto(Trip t, bool hasViolations = false) => new(
        t.Id,
        t.DriverId,
        t.Driver?.FullName ?? string.Empty,
        t.VehicleId,
        t.Vehicle?.VehicleNumber ?? string.Empty,
        t.ShipperName,
        t.LoadNumber,
        t.DistanceMiles,
        t.AverageSpeedMph,
        t.StartTime,
        t.EndTime,
        hasViolations,
        t.OriginLat,
        t.OriginLng,
        t.DestinationLat,
        t.DestinationLng
    );
}