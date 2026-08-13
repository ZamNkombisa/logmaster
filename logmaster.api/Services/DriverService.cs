using LogMaster.Api.Data.Repositories;
using LogMaster.Api.DTOs;
using LogMaster.Api.Models;

namespace LogMaster.Api.Services;

public class DriverService : IDriverService
{
    private readonly IRepository<Driver> _repository;

    public DriverService(IRepository<Driver> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<DriverDto>> GetAllAsync()
    {
        var drivers = await _repository.GetAllAsync();
        return drivers.Select(ToDto);
    }

    public async Task<DriverDto?> GetByIdAsync(int id)
    {
        var driver = await _repository.GetByIdAsync(id);
        return driver is null ? null : ToDto(driver);
    }

    public async Task<DriverDto?> GetByUserIdAsync(string userId)
    {
        var driver = await _repository.FindAsync(d => d.UserId == userId);
        return driver is null ? null : ToDto(driver);
    }

    public async Task<DriverDto> CreateAsync(CreateDriverDto dto)
    {
        var driver = new Driver
        {
            FullName = dto.FullName,
            LicenseNumber = dto.LicenseNumber
        };

        await _repository.AddAsync(driver);
        await _repository.SaveChangesAsync();

        return ToDto(driver);
    }

    public async Task<DriverDto> CreateForUserAsync(string userId, string fullName, string licenseNumber)
    {
        var driver = new Driver
        {
            FullName = fullName,
            LicenseNumber = licenseNumber,
            UserId = userId
        };

        await _repository.AddAsync(driver);
        await _repository.SaveChangesAsync();

        return ToDto(driver);
    }

    public async Task<bool> UpdateAsync(int id, UpdateDriverDto dto)
    {
        var driver = await _repository.GetByIdAsync(id);
        if (driver is null) return false;

        driver.FullName = dto.FullName;
        driver.LicenseNumber = dto.LicenseNumber;

        _repository.Update(driver);
        return await _repository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var driver = await _repository.GetByIdAsync(id);
        if (driver is null) return false;

        _repository.Remove(driver);
        return await _repository.SaveChangesAsync();
    }

    private static DriverDto ToDto(Driver d) => new(d.Id, d.FullName, d.LicenseNumber);
}