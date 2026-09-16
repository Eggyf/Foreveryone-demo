using ForEveryone.Shop.Application.Interfaces;
using MediatR;

namespace ForEveryone.Shop.Application.Features.Items.Queries.GetShopItems;

public class GetShopItemsQueryHandler : IRequestHandler<GetShopItemsQuery, List<ShopItemDto>>
{
    private readonly IShopRepository _shopRepository;

    public GetShopItemsQueryHandler(IShopRepository shopRepository)
    {
        _shopRepository = shopRepository;
    }

    public async Task<List<ShopItemDto>> Handle(GetShopItemsQuery request, CancellationToken cancellationToken)
    {
        var items = await _shopRepository.GetAllAsync();
        return items.Select(i => new ShopItemDto(i.Id, i.Name, i.Description, i.Cost)).ToList();
    }
}