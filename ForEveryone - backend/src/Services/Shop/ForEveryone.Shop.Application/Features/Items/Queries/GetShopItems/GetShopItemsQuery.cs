using MediatR;

namespace ForEveryone.Shop.Application.Features.Items.Queries.GetShopItems;

public record GetShopItemsQuery() : IRequest<List<ShopItemDto>>;
public record ShopItemDto(int Id, string Name, string Description, int Cost);
public record GetShopItemByIdQuery(int Id) : IRequest<ShopItemDetailsDto?>;

public record ShopItemDetailsDto(int Id, string Name, string Description, int Cost, int AttackBoost, int DefenseBoost, bool HealToFull);