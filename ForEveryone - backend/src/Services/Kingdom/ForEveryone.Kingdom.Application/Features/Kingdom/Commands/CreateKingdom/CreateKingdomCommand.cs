using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.CreateKingdom;

public record CreateKingdomCommand(Guid UserId) : IRequest<CreateKingdomResult>;
public record CreateKingdomResult(Guid KingdomId, Guid UserId, int CastleLevel);