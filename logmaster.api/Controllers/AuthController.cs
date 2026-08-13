using LogMaster.Api.DTOs;
using LogMaster.Api.Models;
using LogMaster.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LogMaster.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IJwtService _jwtService;
    private readonly IDriverService _driverService;

    private static readonly string[] AllowedRoles = { "Admin", "Dispatcher", "Driver" };

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IJwtService jwtService,
        IDriverService driverService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtService = jwtService;
        _driverService = driverService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (!AllowedRoles.Contains(dto.Role))
            return BadRequest(new { message = $"Role must be one of: {string.Join(", ", AllowedRoles)}" });

        if (dto.Role == "Driver" && string.IsNullOrWhiteSpace(dto.LicenseNumber))
            return BadRequest(new { message = "LicenseNumber is required when registering as a Driver." });

        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser is not null)
            return BadRequest(new { message = "A user with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description);
            return BadRequest(new { message = "Registration failed.", errors });
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        if (dto.Role == "Driver")
        {
            await _driverService.CreateForUserAsync(user.Id, dto.FullName, dto.LicenseNumber!);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var (token, expiresAt) = _jwtService.GenerateToken(user, roles);

        return Ok(new AuthResponseDto(token, user.Email!, user.FullName ?? string.Empty, roles, expiresAt));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null)
            return Unauthorized(new { message = "Invalid email or password." });

        var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
            return Unauthorized(new { message = "Invalid email or password." });

        var roles = await _userManager.GetRolesAsync(user);
        var (token, expiresAt) = _jwtService.GenerateToken(user, roles);

        return Ok(new AuthResponseDto(token, user.Email!, user.FullName ?? string.Empty, roles, expiresAt));
    }
}