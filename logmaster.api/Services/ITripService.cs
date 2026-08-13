using LogMaster.Api.DTOs;

namespace LogMaster.Api.Services;

public interface ITripService
{
    Task<IEnumerable<TripDto>> GetAllAsync(int? driverIdFilter = null);
    Task<TripDto?> GetByIdAsync(int id);
    Task<(TripDto? Trip, string? Error)> CreateAsync(CreateTripDto dto);
    Task<(LogEntryDto? LogEntry, string? Error)> AddLogEntryAsync(int tripId, CreateLogEntryDto dto);
    Task<IEnumerable<LogEntryDto>> GetLogEntriesAsync(int tripId);
    Task<bool> CompleteAsync(int id);
}