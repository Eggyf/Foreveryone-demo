using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Queries.GetHero;

public record GetHeroQuery(Guid UserId) : IRequest<GetHeroResult?>;

public record GetHeroResult(Guid HeroId, string Class, int Level, int Health, int Attack, int Defense, int Mana);