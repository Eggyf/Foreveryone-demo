using ForEveryone.Kingdom.Application.Interfaces;

namespace ForEveryone.Kingdom.Infrastructure.Services;

public class UserVerificationService : IUserVerificationService
{
    private readonly HttpClient _httpClient;

    public UserVerificationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> VerifyUserExistsAsync(Guid userId)
    {
        var response = await _httpClient.GetAsync($"internal/users/{userId}/exists");
        return response.IsSuccessStatusCode;
    }
}