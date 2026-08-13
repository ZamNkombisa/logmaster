using LogMaster.Api.Data.Repositories;
using LogMaster.Api.DTOs;
using LogMaster.Api.Models;

namespace LogMaster.Api.Services;

public class VehicleService : IVehicleService
{
    private readonly IRepository<Vehicle> _repository;

    public VehicleService(IRepository<Vehicle> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<VehicleDto>> GetAllAsync()
    {
        var vehicles = await _repository.GetAllAsync();
        return vehicles.Select(ToDto);
    }

    public async Task<VehicleDto?> GetByIdAsync(int id)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        return vehicle is null ? null : ToDto(vehicle);
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            VehicleNumber = dto.VehicleNumber,
            LicensePlate = dto.LicensePlate
        };

        await _repository.AddAsync(vehicle);
        await _repository.SaveChangesAsync();

        return ToDto(vehicle);
    }

    public async Task<bool> UpdateAsync(int id, UpdateVehicleDto dto)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        if (vehicle is null) return false;

        vehicle.VehicleNumber = dto.VehicleNumber;
        vehicle.LicensePlate = dto.LicensePlate;

        _repository.Update(vehicle);
        return await _repository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        if (vehicle is null) return false;

        _repository.Remove(vehicle);
        return await _repository.SaveChangesAsync();
    }

    private static VehicleDto ToDto(Vehicle v) => new(v.Id, v.VehicleNumber, v.LicensePlate);
}