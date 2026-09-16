using MediatR;
using ForEveryone.Kingdom.Domain; // Para BuildingType

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Queries.GetKingdom;

public record GetKingdomQuery(Guid UserId) : IRequest<GetKingdomResult?>;

public record GetKingdomResult(Guid KingdomId, int CastleLevel, int Wood, int Stone, int Gold, int Food, List<string> Buildings);