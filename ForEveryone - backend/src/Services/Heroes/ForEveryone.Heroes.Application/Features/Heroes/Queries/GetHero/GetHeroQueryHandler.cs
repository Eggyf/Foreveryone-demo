using ForEveryone.Heroes.Application.Interfaces;
using Heroes.Application.Interfaces;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Queries.GetHero;

public class GetHeroQueryHandler : IRequestHandler<GetHeroQuery, GetHeroResult?>
{


    private readonly IHeroRepository _heroRepository;

    public GetHeroQueryHandler(IHeroRepository heroRepository)
    {
        _heroRepository = heroRepository;
    }

    public async Task<GetHeroResult?> Handle(GetHeroQuery request, CancellationToken cancellationToken)
    {
        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null) return null;

        return new GetHeroResult(
    hero.Id,
    hero.Class.ToString(),
    hero.Level,
    hero.Stats.Health,
    hero.Stats.Attack,
    hero.Stats.Defense,
    hero.Stats.Mana,
    hero.CurrentHealth,
    hero.Gold // <-- NUEVO
);
    }


}