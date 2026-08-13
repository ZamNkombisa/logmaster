namespace LogMaster.Api.DTOs;

public record ComplianceFlagDto(int Id, string RuleCode, string Description, string Severity, DateTime DetectedAt);