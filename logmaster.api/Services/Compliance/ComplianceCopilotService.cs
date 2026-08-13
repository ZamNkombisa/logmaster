using System.Text;
using System.Text.Json;
using LogMaster.Api.Data.Repositories;

namespace LogMaster.Api.Services;

public class ComplianceCopilotService : IComplianceCopilotService
{
    private readonly ITripRepository _tripRepository;
    private readonly IRepository<Models.ComplianceFlag> _flagRepository;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public ComplianceCopilotService(
        ITripRepository tripRepository,
        IRepository<Models.ComplianceFlag> flagRepository,
        IHttpClientFactory httpClientFactory,
        IConfiguration config)
    {
        _tripRepository = tripRepository;
        _flagRepository = flagRepository;
        _httpClient = httpClientFactory.CreateClient();
        _config = config;
    }

    public async Task<(string? Answer, string? Error)> AskAsync(int tripId, string question)
    {
        // --- Retrieval step: pull the real, grounded data for this specific trip ---
        var trip = await _tripRepository.GetByIdWithDetailsAsync(tripId);
        if (trip is null) return (null, $"Trip with id {tripId} does not exist.");

        var flags = await _flagRepository.FindAllAsync(f => f.TripId == tripId);

        var context = BuildContext(trip, flags);

        // --- Generation step: ground the LLM strictly in that retrieved data ---
        var apiKey = _config["Groq:ApiKey"];
        if (string.IsNullOrEmpty(apiKey)) return (null, "Copilot is not configured (missing API key).");

        var requestBody = new
        {
            model = "llama-3.3-70b-versatile",
            messages = new object[]
            {
                new { role = "system", content =
                    "You are a compliance assistant for a trucking ELD system. " +
                    "Answer the dispatcher's question using ONLY the trip data provided below. " +
                    "If the answer isn't in the data, say you don't have enough information rather than guessing. " +
                    "Be concise and factual.\n\n" + context },
                new { role = "user", content = question }
            },
            temperature = 0.2
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions")
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        };
        request.Headers.Add("Authorization", $"Bearer {apiKey}");

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            return (null, $"Copilot request failed: {response.StatusCode} — {body}");
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var answer = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return (answer, null);
    }

    private static string BuildContext(Models.Trip trip, IEnumerable<Models.ComplianceFlag> flags)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Trip #{trip.Id}: {trip.ShipperName}, Load #{trip.LoadNumber}");
        sb.AppendLine($"Driver: {trip.Driver?.FullName ?? "Unknown"}");
        sb.AppendLine($"Vehicle: {trip.Vehicle?.VehicleNumber ?? "Unknown"}");
        sb.AppendLine($"Distance: {trip.DistanceMiles} mi, Avg speed: {trip.AverageSpeedMph} mph");
        sb.AppendLine($"Started: {trip.StartTime:u}, Ended: {(trip.EndTime.HasValue ? trip.EndTime.Value.ToString("u") : "in progress")}");

        sb.AppendLine("\nDuty status log:");
        foreach (var entry in trip.LogEntries.OrderBy(e => e.StartTime))
        {
            var hours = (entry.EndTime - entry.StartTime).TotalHours;
            sb.AppendLine($"- {entry.Status} from {entry.StartTime:u} to {entry.EndTime:u} ({hours:F1} hours){(entry.IsAuto ? " [auto-filled]" : "")}");
        }

        var flagList = flags.ToList();
        sb.AppendLine(flagList.Count == 0 ? "\nCompliance flags: none recorded." : "\nCompliance flags:");
        foreach (var flag in flagList)
        {
            sb.AppendLine($"- [{flag.Severity}] {flag.RuleCode}: {flag.Description}");
        }

        return sb.ToString();
    }
}