using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.RestHero;

public record RestHeroCommand(Guid UserId) : IRequest<RestHeroResult>;
public record RestHeroResult(int CurrentHealth, string Message);