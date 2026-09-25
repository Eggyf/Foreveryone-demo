using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Queries.GetHero;

public record GetHeroQuery(Guid UserId) : IRequest<GetHeroResult?>;

public record GetHeroResult(
    Guid HeroId,
    string Race,
    string Class,
    int Level,
    int Health,
    int Attack,
    int Defense,
    int Mana,
    int CurrentHealth,
    int Gold);
