using LogMaster.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogMaster.Api.Data.Repositories;

public class TripRepository : Repository<Trip>, ITripRepository
{
    public TripRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Trip>> GetAllWithDetailsAsync() =>
        await _context.Trips
            .Include(t => t.Driver)
            .Include(t => t.Vehicle)
            .ToListAsync();

    public async Task<IEnumerable<Trip>> GetAllWithDetailsAsync(int driverId) =>
        await _context.Trips
            .Include(t => t.Driver)
            .Include(t => t.Vehicle)
            .Where(t => t.DriverId == driverId)
            .ToListAsync();

    public async Task<Trip?> GetByIdWithDetailsAsync(int id) =>
        await _context.Trips
            .Include(t => t.LogEntries)
            .Include(t => t.Driver)
            .Include(t => t.Vehicle)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<Trip?> GetPreviousTripAsync(int driverId, DateTime beforeStartTime) =>
        await _context.Trips
            .Include(t => t.LogEntries)
            .Where(t => t.DriverId == driverId && t.StartTime < beforeStartTime)
            .OrderByDescending(t => t.StartTime)
            .FirstOrDefaultAsync();
}