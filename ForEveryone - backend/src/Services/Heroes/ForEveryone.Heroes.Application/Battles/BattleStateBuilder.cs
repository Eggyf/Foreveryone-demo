using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;
using ForEveryone.Heroes.Domain;
using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Application.Battles;

/// <summary>
/// Construye el estado de combate que ve el cliente a partir del heroe y de la
/// batalla. La forma de calcularlo (reproduccion determinista) la decide
/// <see cref="BattleEngine"/>; aqui solo se proyecta al contrato de la API.
///
/// El maná que se manda es el de <i>después</i> del turno anterior, que es
/// cuando le toca volver a elegir. El maná se regenera al empezar el turno, de
/// forma que el siguiente salto se ve al confirmar la accion y no antes.
/// </summary>
public static class BattleStateBuilder
{
    public static BattleStateDto Build(
        Hero hero,
        Battle battle,
        Enemy enemy,
        bool applyRewards)
    {
        var actions = battle.Actions;
        var replay = BattleEngine.Replay(
            hero.Class, hero.Stats, battle.HeroHealthAtStart, battle.HeroManaAtStart, enemy, actions);

        var message = replay.Finished
            ? replay.Victory
                ? LocalizedText.Of(
                    "battle.outcome.victory",
                    ("enemyKey", enemy.Key),
                    ("experienceGained", replay.ExperienceGained),
                    ("goldGained", replay.GoldGained))
                : LocalizedText.Of("battle.outcome.defeat", ("enemyKey", enemy.Key))
            : LocalizedText.Of("battle.turn.prompt", ("round", replay.Rounds.Count + 1));

        return new BattleStateDto(
            battle.Id,
            enemy.Key,
            enemy.NameKey,
            replay.Rounds.Count,
            replay.EnemyHealth,
            enemy.Health,
            enemy.Attack,
            enemy.Defense,
            replay.HeroHealth,
            hero.Stats.Health,
            replay.HeroMana,
            hero.Stats.Mana,
            hero.Stats.Attack,
            hero.Stats.Defense,
            replay.Finished,
            replay.Victory,
            // Las recompensas solo se muestran una vez aplicado el cierre, para
            // que el cliente no las anuncie antes de tiempo.
            applyRewards ? replay.ExperienceGained : 0,
            applyRewards ? replay.GoldGained : 0,
            BuildActions(hero, enemy, actions, replay),
            replay.Rounds
                .Select(r => new BattleRoundDto(
                    r.Round, r.Action, r.HeroDamage, r.EnemyDamage,
                    r.EnemyHealthRemaining, r.HeroHealthRemaining, r.HeroManaRemaining, r.Message))
                .ToList(),
            message);
    }

    /// <summary>
    /// Proyecta el kit entero de la clase, no un par de acciones fijas: asi el
    /// jugador ve siempre sus tres opciones con el nombre y el coste reales, y
    /// el cliente no tiene que decidir que boton es "la habilidad".
    /// </summary>
    private static IReadOnlyList<BattleActionDto> BuildActions(
        Hero hero, Enemy enemy, IReadOnlyList<BattleAction> actions, BattleReplay replay)
    {
        if (replay.Finished) return [];

        return ClassAbilities.For(hero.Class)
            .Select(ability =>
            {
                var usesLeft = BattleEngine.UsesLeft(ability, actions);
                var reason = BattleEngine.Unavailability(
                    ability.Action, hero.Class, hero.Stats, replay.HeroMana, actions);

                return new BattleActionDto(
                    ability.Action,
                    ability.NameKey,
                    ability.DescriptionKey,
                    BattleEngine.DamageFor(ability, hero.Stats, enemy),
                    ClassAbilities.ManaCost(hero.Stats, ability),
                    reason is null,
                    ability.UseLimit <= 0 ? -1 : usesLeft,
                    ability.UseLimit,
                    reason);
            })
            .ToList();
    }
}
