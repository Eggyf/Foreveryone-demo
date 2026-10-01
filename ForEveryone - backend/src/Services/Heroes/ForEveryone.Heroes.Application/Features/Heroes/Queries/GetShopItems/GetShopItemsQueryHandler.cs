using MediatR;

namespace Heroes.Application.Features.Heroes.Queries.GetShopItems;

/// <summary>
/// Catalogo de objetos de la tienda.
///
/// Los nombres y las descripciones son claves de traduccion: los Articulos son
/// contenido fijo, igual que los edificios, y el cliente ya traduce el catalogo.
/// El emoji va en la clave porque forma parte de la presentacion, no del balance.
/// </summary>
public class GetShopItemsQueryHandler : IRequestHandler<GetShopItemsQuery, List<ShopItemDto>>
{
    public Task<List<ShopItemDto>> Handle(GetShopItemsQuery request, CancellationToken cancellationToken)
    {
        var items = new List<ShopItemDto>
        {
            new(1, "sword", "shopItem.sword.name", "shopItem.sword.desc", 100),
            new(2, "armor", "shopItem.armor.name", "shopItem.armor.desc", 150),
            new(3, "potion", "shopItem.potion.name", "shopItem.potion.desc", 50)
        };

        return Task.FromResult(items);
    }
}