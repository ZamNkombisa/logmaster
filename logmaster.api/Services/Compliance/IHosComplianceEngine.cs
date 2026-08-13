using LogMaster.Api.Models;

namespace LogMaster.Api.Services.Compliance;

public interface IHosComplianceEngine
{
    IReadOnlyList<ComplianceFlag> Evaluate(Trip trip, Trip? previousTrip);
}