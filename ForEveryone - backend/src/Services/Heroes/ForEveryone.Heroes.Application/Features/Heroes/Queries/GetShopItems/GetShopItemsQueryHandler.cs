using MediatR;

namespace Heroes.Application.Features.Heroes.Queries.GetShopItems;

public class GetShopItemsQueryHandler : IRequestHandler<GetShopItemsQuery, List<ShopItemDto>>
{
    public Task<List<ShopItemDto>> Handle(GetShopItemsQuery request, CancellationToken cancellationToken)
    {
        var items = new List<ShopItemDto>
        {
            new ShopItemDto("sword", "🗡️ Espada de Hierro", "Aumenta el Ataque +10 permanentemente.", 100),
            new ShopItemDto("armor", "🛡️ Armadura de Cuero", "Aumenta la Defensa +10 permanentemente.", 150),
            new ShopItemDto("potion", "🧪 Poción de Vida", "Restaura toda tu vida al instante.", 50)
        };

        return Task.FromResult(items);
    }
}