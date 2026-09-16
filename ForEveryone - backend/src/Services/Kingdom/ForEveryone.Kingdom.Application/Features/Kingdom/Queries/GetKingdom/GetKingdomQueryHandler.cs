using ForEveryone.Kingdom.Application.Interfaces;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Queries.GetKingdom;

public class GetKingdomQueryHandler : IRequestHandler<GetKingdomQuery, GetKingdomResult?>
{
    private readonly IKingdomRepository _kingdomRepository;

    public GetKingdomQueryHandler(IKingdomRepository kingdomRepository)
    {
        _kingdomRepository = kingdomRepository;
    }

    public async Task<GetKingdomResult?> Handle(GetKingdomQuery request, CancellationToken cancellationToken)
    {
        var kingdom = await _kingdomRepository.GetByUserIdAsync(request.UserId);
        if (kingdom is null) return null;

        return new GetKingdomResult(
            kingdom.Id,
            kingdom.CastleLevel,
            kingdom.Resources.Wood,
            kingdom.Resources.Stone,
            kingdom.Resources.Gold,
            kingdom.Resources.Food,
            kingdom.Buildings.Select(b => $"{b.Type} (Nv.{b.Level})").ToList()
        );
    }
}