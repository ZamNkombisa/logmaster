using LogMaster.Api.Data.Repositories;
using LogMaster.Api.DTOs;
using LogMaster.Api.Models;
using LogMaster.Api.Services.Compliance;

namespace LogMaster.Api.Services;

public class ComplianceService : IComplianceService
{
    private readonly ITripRepository _tripRepository;
    private readonly IRepository<ComplianceFlag> _flagRepository;
    private readonly IHosComplianceEngine _engine;

    public ComplianceService(
        ITripRepository tripRepository,
        IRepository<ComplianceFlag> flagRepository,
        IHosComplianceEngine engine)
    {
        _tripRepository = tripRepository;
        _flagRepository = flagRepository;
        _engine = engine;
    }

    public async Task<(IEnumerable<ComplianceFlagDto>? Flags, string? Error)> EvaluateTripAsync(int tripId)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(tripId);
        if (trip is null) return (null, $"Trip with id {tripId} does not exist.");

        var previousTrip = await _tripRepository.GetPreviousTripAsync(trip.DriverId, trip.StartTime);

        // Clear previously computed flags before re-evaluating
        var existingFlags = await _flagRepository.FindAllAsync(f => f.TripId == tripId);
        foreach (var old in existingFlags) _flagRepository.Remove(old);

        var newFlags = _engine.Evaluate(trip, previousTrip);
        foreach (var flag in newFlags) await _flagRepository.AddAsync(flag);

        await _flagRepository.SaveChangesAsync();

        return (newFlags.Select(ToDto), null);
    }

    public async Task<IEnumerable<ComplianceFlagDto>> GetFlagsForTripAsync(int tripId)
    {
        var flags = await _flagRepository.FindAllAsync(f => f.TripId == tripId);
        return flags.Select(ToDto);
    }

    private static ComplianceFlagDto ToDto(ComplianceFlag f) =>
        new(f.Id, f.RuleCode, f.Description, f.Severity.ToString(), f.DetectedAt);
}