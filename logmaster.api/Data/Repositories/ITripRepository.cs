using LogMaster.Api.Models;

namespace LogMaster.Api.Data.Repositories;

public interface ITripRepository : IRepository<Trip>
{
    Task<IEnumerable<Trip>> GetAllWithDetailsAsync();
    Task<IEnumerable<Trip>> GetAllWithDetailsAsync(int driverId);
    Task<Trip?> GetByIdWithDetailsAsync(int id);
    Task<Trip?> GetPreviousTripAsync(int driverId, DateTime beforeStartTime);
}