using Heroes.Application.Interfaces;
using System.Net.Http.Json;

namespace Heroes.Infrastructure.Services;

public class ShopCatalogService : IShopCatalogService
{
    private readonly HttpClient _httpClient;

    public ShopCatalogService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ShopItemDto?> GetItemByIdAsync(int itemId)
    {
        // Llama al nuevo endpoint de Shop.Api
        var response = await _httpClient.GetAsync($"api/shop/{itemId}");
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<ShopItemDto>();
    }
}