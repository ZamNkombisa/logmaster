using LogMaster.Api.DTOs;

namespace LogMaster.Api.Services;

public interface IComplianceService
{
    Task<(IEnumerable<ComplianceFlagDto>? Flags, string? Error)> EvaluateTripAsync(int tripId);
    Task<IEnumerable<ComplianceFlagDto>> GetFlagsForTripAsync(int tripId);
}