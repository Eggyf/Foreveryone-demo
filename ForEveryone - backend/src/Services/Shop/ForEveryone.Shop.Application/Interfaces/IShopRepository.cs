using ForEveryone.Shop.Domain;

namespace ForEveryone.Shop.Application.Interfaces;

public interface IShopRepository
{
    Task<List<ShopItem>> GetAllAsync();
    Task<ShopItem?> GetByIdAsync(int id);
}