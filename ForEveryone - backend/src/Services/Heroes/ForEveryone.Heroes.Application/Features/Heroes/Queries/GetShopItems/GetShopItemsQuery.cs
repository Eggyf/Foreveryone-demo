using MediatR;

namespace Heroes.Application.Features.Heroes.Queries.GetShopItems;

public record GetShopItemsQuery() : IRequest<List<ShopItemDto>>;

/// <summary>
/// Articulo del catalogo que Heroes expone al cliente. <see cref="NameKey"/> y
/// <see cref="DescriptionKey"/> son claves de traduccion: el cliente las resuelve
/// en el idioma del jugador.
/// </summary>
public record ShopItemDto(int Id, string Key, string NameKey, string DescriptionKey, int Cost);