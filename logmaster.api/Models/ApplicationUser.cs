using Microsoft.AspNetCore.Identity;

namespace LogMaster.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
}