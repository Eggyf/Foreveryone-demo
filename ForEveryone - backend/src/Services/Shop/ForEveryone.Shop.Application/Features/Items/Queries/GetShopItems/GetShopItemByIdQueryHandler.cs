using ForEveryone.Shop.Application.Interfaces;
using MediatR;

namespace ForEveryone.Shop.Application.Features.Items.Queries.GetShopItems;

public class GetShopItemByIdQueryHandler : IRequestHandler<GetShopItemByIdQuery, ShopItemDetailsDto?>
{
    private readonly IShopRepository _shopRepository;

    public GetShopItemByIdQueryHandler(IShopRepository shopRepository)
    {
        _shopRepository = shopRepository;
    }

    public async Task<ShopItemDetailsDto?> Handle(GetShopItemByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await _shopRepository.GetByIdAsync(request.Id);
        if (item is null) return null;

        return new ShopItemDetailsDto(
            item.Id, item.Name, item.Description, item.Cost,
            item.AttackBoost, item.DefenseBoost, item.HealToFull
        );
    }
}