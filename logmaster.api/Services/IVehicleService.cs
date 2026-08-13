using LogMaster.Api.DTOs;

namespace LogMaster.Api.Services;

public interface IVehicleService
{
    Task<IEnumerable<VehicleDto>> GetAllAsync();
    Task<VehicleDto?> GetByIdAsync(int id);
    Task<VehicleDto> CreateAsync(CreateVehicleDto dto);
    Task<bool> UpdateAsync(int id, UpdateVehicleDto dto);
    Task<bool> DeleteAsync(int id);
}