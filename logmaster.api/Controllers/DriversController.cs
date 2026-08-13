using LogMaster.Api.DTOs;
using LogMaster.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace LogMaster.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;

    public DriversController(IDriverService driverService)
    {
        _driverService = driverService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DriverDto>>> GetAll()
    {
        return Ok(await _driverService.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DriverDto>> GetById(int id)
    {
        var driver = await _driverService.GetByIdAsync(id);
        return driver is null ? NotFound() : Ok(driver);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<DriverDto>> Create(CreateDriverDto dto)
    {
        var created = await _driverService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<IActionResult> Update(int id, UpdateDriverDto dto)
    {
        var success = await _driverService.UpdateAsync(id, dto);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _driverService.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}