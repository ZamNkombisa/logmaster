using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using LogMaster.Api.Models;

namespace LogMaster.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<LogEntry> LogEntries => Set<LogEntry>();
    public DbSet<ComplianceFlag> ComplianceFlags => Set<ComplianceFlag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // required for Identity's own tables

        modelBuilder.Entity<Trip>()
            .HasOne(t => t.Driver)
            .WithMany(d => d.Trips)
            .HasForeignKey(t => t.DriverId);

        modelBuilder.Entity<Trip>()
            .HasOne(t => t.Vehicle)
            .WithMany(v => v.Trips)
            .HasForeignKey(t => t.VehicleId);

        modelBuilder.Entity<LogEntry>()
            .HasOne(l => l.Trip)
            .WithMany(t => t.LogEntries)
            .HasForeignKey(l => l.TripId);

        modelBuilder.Entity<ComplianceFlag>()
            .HasOne(f => f.Trip)
            .WithMany(t => t.ComplianceFlags)
            .HasForeignKey(f => f.TripId);
    }
}