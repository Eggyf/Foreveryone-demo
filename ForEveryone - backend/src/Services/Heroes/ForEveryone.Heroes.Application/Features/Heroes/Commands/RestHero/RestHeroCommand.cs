using ForEveryone.SharedKernel;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.RestHero;

public record RestHeroCommand(Guid UserId) : IRequest<RestHeroResult>;

/// <summary>
/// El mensaje es una clave de traduccion, no una frase: el servidor no sabe en
/// que idioma lee el jugador.
/// </summary>
public record RestHeroResult(int CurrentHealth, LocalizedText Message);