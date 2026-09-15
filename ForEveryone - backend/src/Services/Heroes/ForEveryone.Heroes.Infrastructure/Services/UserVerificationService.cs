using ForEveryone.Heroes.Application.Interfaces;
using System.Net.Http.Json;

namespace ForEveryone.Heroes.Infrastructure.Services;

public class UserVerificationService : IUserVerificationService
{
    private readonly HttpClient _httpClient;

    public UserVerificationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> VerifyUserExistsAsync(Guid userId)
    {
        // Llama a Identity.Api
        var response = await _httpClient.GetAsync($"internal/users/{userId}/exists");
        return response.IsSuccessStatusCode;
    }
}