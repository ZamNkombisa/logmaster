namespace LogMaster.Api.Services;

public interface IComplianceCopilotService
{
    Task<(string? Answer, string? Error)> AskAsync(int tripId, string question);
}