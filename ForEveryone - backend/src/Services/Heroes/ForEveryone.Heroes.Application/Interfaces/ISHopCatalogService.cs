namespace Heroes.Application.Interfaces;

public interface IShopCatalogService
{
    Task<ShopItemDto?> GetItemByIdAsync(int itemId);
}

/// <summary>
/// Articulo tal y como lo ve Heroes al comprar. Los nombres son claves de
/// traduccion: el detalle de la compra lo redacta el cliente.
/// </summary>
public record ShopItemDto(
    int Id,
    string Key,
    string NameKey,
    string DescriptionKey,
    int Cost,
    int AttackBoost,
    int DefenseBoost,
    bool HealToFull);