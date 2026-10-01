using ForEveryone.SharedKernel;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.EmbarkOnAdventure;

public record EmbarkOnAdventureCommand(Guid UserId) : IRequest<AdventureResult>;

/// <summary>
/// El mensaje es una clave de traduccion con sus argumentos, no una frase.
/// </summary>
public record AdventureResult(
    bool Victory,
    int ExperienceGained,
    int LevelBefore,
    int LevelAfter,
    LocalizedText Message);