namespace LogMaster.Api.DTOs;

public record UserDto(string Id, string Email, string FullName, IList<string> Roles);

public record UpdateUserRoleDto(string Role);