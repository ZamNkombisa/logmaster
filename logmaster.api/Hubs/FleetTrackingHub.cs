using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LogMaster.Api.Hubs;

[Authorize]
public class FleetTrackingHub : Hub
{
    // Drivers call this from their own trip
    [Authorize(Roles = "Driver")]
    public async Task SendLocationUpdate(int tripId, double lat, double lng)
    {
        // Broadcast to anyone watching this specific trip (the driver's own map)
        await Clients.Group($"trip-{tripId}").SendAsync("ReceiveLocationUpdate", tripId, lat, lng, DateTime.UtcNow);

        // Also broadcast to dispatchers watching the whole fleet
        await Clients.Group("fleet-watchers").SendAsync("ReceiveLocationUpdate", tripId, lat, lng, DateTime.UtcNow);
    }

    // Any authenticated user can watch a specific trip's live position
    public async Task JoinTripGroup(int tripId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"trip-{tripId}");
    }

    public async Task LeaveTripGroup(int tripId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"trip-{tripId}");
    }

    // Dispatchers/Admins join this to see every active driver moving
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task JoinFleetWatch()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "fleet-watchers");
    }
}