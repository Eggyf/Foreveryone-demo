using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.BuyItem;

public record BuyItemCommand(Guid UserId, int ItemId) : IRequest<BuyItemResult>;
public record BuyItemResult(string Message, int CurrentGold);