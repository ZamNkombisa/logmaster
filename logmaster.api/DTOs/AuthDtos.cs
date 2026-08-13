namespace LogMaster.Api.DTOs;

public record RegisterDto(string Email, string Password, string FullName, string Role, string? LicenseNumber = null);

public record LoginDto(string Email, string Password);

public record AuthResponseDto(string Token, string Email, string FullName, IList<string> Roles, DateTime ExpiresAt);