using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Queries.GetCharacterOptions;

/// <summary>
/// Una clase con sus estadisticas base, antes de aplicar el bonus de raza.
/// </summary>
public record CharacterClassOption(int Id, string Name, int Health, int Attack, int Defense, int Mana);

/// <summary>
/// Una raza con los modificadores porcentuales que aplica a las estadisticas.
/// </summary>
public record CharacterRaceOption(
    int Id,
    string Name,
    int HealthPercent,
    int AttackPercent,
    int DefensePercent,
    int ManaPercent);

public record GetCharacterOptionsResult(
    IReadOnlyList<CharacterRaceOption> Races,
    IReadOnlyList<CharacterClassOption> Classes) : IRequest<GetCharacterOptionsResult>;
