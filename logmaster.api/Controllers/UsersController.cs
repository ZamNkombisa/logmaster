using LogMaster.Api.DTOs;
using LogMaster.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LogMaster.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    private static readonly string[] AllowedRoles = { "Admin", "Dispatcher", "Driver" };

    public UsersController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = _userManager.Users.ToList();
        var result = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new UserDto(user.Id, user.Email ?? string.Empty, user.FullName ?? string.Empty, roles));
        }

        return Ok(result);
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole(string id, UpdateUserRoleDto dto)
    {
        if (!AllowedRoles.Contains(dto.Role))
            return BadRequest(new { message = $"Role must be one of: {string.Join(", ", AllowedRoles)}" });

        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, dto.Role);

        return NoContent();
    }
}