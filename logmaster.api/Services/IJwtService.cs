using LogMaster.Api.Models;

namespace LogMaster.Api.Services;

public interface IJwtService
{
    (string Token, DateTime ExpiresAt) GenerateToken(ApplicationUser user, IList<string> roles);
}