using System.Security.Claims;
using LogMaster.Api.DTOs;
using LogMaster.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogMaster.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;
    private readonly IDriverService _driverService;
    private readonly IComplianceService _complianceService;
    private readonly IComplianceCopilotService _complianceCopilotService;

    public TripsController(
    ITripService tripService,
    IDriverService driverService,
    IComplianceService complianceService,
    IComplianceCopilotService complianceCopilotService)
    {
        _tripService = tripService;
        _driverService = driverService;
        _complianceService = complianceService;
        _complianceCopilotService = complianceCopilotService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetAll()
    {
        int? driverIdFilter = null;

        var isPrivileged = User.IsInRole("Admin") || User.IsInRole("Dispatcher");
        if (!isPrivileged)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var driver = userId is null ? null : await _driverService.GetByUserIdAsync(userId);
            driverIdFilter = driver?.Id ?? -1;
        }

        return Ok(await _tripService.GetAllAsync(driverIdFilter));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TripDto>> GetById(int id)
    {
        var trip = await _tripService.GetByIdAsync(id);
        return trip is null ? NotFound() : Ok(trip);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task<ActionResult<TripDto>> Create(CreateTripDto dto)
    {
        if (User.IsInRole("Driver") && !User.IsInRole("Admin") && !User.IsInRole("Dispatcher"))
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var driver = userId is null ? null : await _driverService.GetByUserIdAsync(userId);
            if (driver is null) return BadRequest(new { message = "No driver profile linked to this account." });

            dto = dto with { DriverId = driver.Id };
        }

        var (trip, error) = await _tripService.CreateAsync(dto);
        if (error is not null) return BadRequest(new { message = error });
        return CreatedAtAction(nameof(GetById), new { id = trip!.Id }, trip);
    }

    [HttpPut("{id}/complete")]
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task<IActionResult> Complete(int id)
    {
        if (User.IsInRole("Driver") && !User.IsInRole("Admin") && !User.IsInRole("Dispatcher"))
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var driver = userId is null ? null : await _driverService.GetByUserIdAsync(userId);
            var trip = await _tripService.GetByIdAsync(id);

            if (driver is null || trip is null || trip.DriverId != driver.Id)
                return Forbid();
        }

        var success = await _tripService.CompleteAsync(id);
        return success ? NoContent() : NotFound();
    }

    [HttpPost("{id}/log-entries")]
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task<ActionResult<LogEntryDto>> AddLogEntry(int id, CreateLogEntryDto dto)
    {
        var (logEntry, error) = await _tripService.AddLogEntryAsync(id, dto);
        if (error is not null) return BadRequest(new { message = error });
        return Ok(logEntry);
    }

    [HttpPost("{id}/evaluate-compliance")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<IEnumerable<ComplianceFlagDto>>> EvaluateCompliance(int id)
    {
        var (flags, error) = await _complianceService.EvaluateTripAsync(id);
        return error is not null ? NotFound(new { message = error }) : Ok(flags);
    }

    [HttpPost("{id}/copilot/ask")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<CopilotAnswerDto>> AskCopilot(int id, CopilotAskDto dto)
    {
        var (answer, error) = await _complianceCopilotService.AskAsync(id, dto.Question);
        if (error is not null) return BadRequest(new { message = error });
        return Ok(new CopilotAnswerDto(answer!));
    }

    [HttpGet("{id}/compliance-flags")]
    public async Task<ActionResult<IEnumerable<ComplianceFlagDto>>> GetComplianceFlags(int id)
    {
        return Ok(await _complianceService.GetFlagsForTripAsync(id));
    }

    [HttpGet("{id}/log-entries")]
    public async Task<ActionResult<IEnumerable<LogEntryDto>>> GetLogEntries(int id)
    {
        return Ok(await _tripService.GetLogEntriesAsync(id));
    }
}