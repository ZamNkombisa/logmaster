using LogMaster.Api.Models;

namespace LogMaster.Api.DTOs;

public record LogEntryDto(int Id, string Status, DateTime StartTime, DateTime EndTime, bool IsAuto);

public record CreateLogEntryDto(DutyStatus Status, DateTime StartTime, DateTime EndTime);