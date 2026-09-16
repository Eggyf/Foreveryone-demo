namespace Heroes.Application.Interfaces;

public interface IShopCatalogService
{
    Task<ShopItemDto?> GetItemByIdAsync(int itemId);
}

public record ShopItemDto(int Id, string Name, int Cost, int AttackBoost, int DefenseBoost, bool HealToFull);