using MediatR;

namespace ForEveryone.Shop.Application.Features.Items.Queries.GetShopItems;

public record GetShopItemsQuery() : IRequest<List<ShopItemDto>>;

/// <summary>
/// Articulo del catalogo. <see cref="NameKey"/> y <see cref="DescriptionKey"/>
/// son claves de traduccion: el cliente las resuelve en el idioma del jugador.
/// </summary>
public record ShopItemDto(int Id, string Key, string NameKey, string DescriptionKey, int Cost);

public record GetShopItemByIdQuery(int Id) : IRequest<ShopItemDetailsDto?>;

public record ShopItemDetailsDto(
    int Id,
    string Key,
    string NameKey,
    string DescriptionKey,
    int Cost,
    int AttackBoost,
    int DefenseBoost,
    bool HealToFull);