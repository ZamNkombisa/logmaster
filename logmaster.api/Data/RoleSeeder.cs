using Microsoft.AspNetCore.Identity;

namespace LogMaster.Api.Data;

public static class RoleSeeder
{
    private static readonly string[] Roles = { "Admin", "Dispatcher", "Driver" };

    public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }
}