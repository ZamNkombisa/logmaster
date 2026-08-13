using System.Security.Claims;
using LogMaster.Api.DTOs;

namespace LogMaster.Api.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(ClaimsPrincipal user);
}