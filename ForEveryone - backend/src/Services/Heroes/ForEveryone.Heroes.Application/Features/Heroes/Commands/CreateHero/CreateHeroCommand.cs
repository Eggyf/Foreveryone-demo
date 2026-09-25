using ForEveryone.Heroes.Domain;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;

public record CreateHeroCommand(Guid UserId, Race Race, HeroClass Class) : IRequest<CreateHeroResult>;
public record CreateHeroResult(Guid HeroId, Guid UserId, string Race, string Class);
