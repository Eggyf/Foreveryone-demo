using MediatR;

namespace Heroes.Application.Features.Heroes.Queries.GetShopItems;

public record GetShopItemsQuery() : IRequest<List<ShopItemDto>>;

public record ShopItemDto(string Id, string Name, string Description, int Cost);