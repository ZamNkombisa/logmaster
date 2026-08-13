using LogMaster.Api.DTOs;

namespace LogMaster.Api.Services;

public interface IDriverService
{
    Task<IEnumerable<DriverDto>> GetAllAsync();
    Task<DriverDto?> GetByIdAsync(int id);
    Task<DriverDto?> GetByUserIdAsync(string userId);
    Task<DriverDto> CreateAsync(CreateDriverDto dto);
    Task<DriverDto> CreateForUserAsync(string userId, string fullName, string licenseNumber);
    Task<bool> UpdateAsync(int id, UpdateDriverDto dto);
    Task<bool> DeleteAsync(int id);
}