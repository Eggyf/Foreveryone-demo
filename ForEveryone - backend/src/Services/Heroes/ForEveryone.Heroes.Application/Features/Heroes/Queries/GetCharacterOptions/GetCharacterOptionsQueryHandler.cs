using ForEveryone.Heroes.Domain;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Queries.GetCharacterOptions;

/// <summary>
/// Expone el catalogo de razas y clases con sus estadisticas para que el
/// asistente de creacion de personaje no tenga que duplicar el balance.
/// </summary>
public class GetCharacterOptionsQueryHandler
    : IRequestHandler<GetCharacterOptionsResult, GetCharacterOptionsResult>
{
    public Task<GetCharacterOptionsResult> Handle(
        GetCharacterOptionsResult request,
        CancellationToken cancellationToken)
    {
        var races = Enum.GetValues<Race>()
            .Select(race =>
            {
                var bonus = RaceBonus.For(race);
                return new CharacterRaceOption(
                    (int)race,
                    race.ToString(),
                    bonus.HealthPercent,
                    bonus.AttackPercent,
                    bonus.DefensePercent,
                    bonus.ManaPercent);
            })
            .ToList();

        var classes = Enum.GetValues<HeroClass>()
            .Select(heroClass =>
            {
                var stats = ClassBonus.For(heroClass);
                return new CharacterClassOption(
                    (int)heroClass,
                    heroClass.ToString(),
                    stats.Health,
                    stats.Attack,
                    stats.Defense,
                    stats.Mana);
            })
            .ToList();

        return Task.FromResult(new GetCharacterOptionsResult(races, classes));
    }
}
