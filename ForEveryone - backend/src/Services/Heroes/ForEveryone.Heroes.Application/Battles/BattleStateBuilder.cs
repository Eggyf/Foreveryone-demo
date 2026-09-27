using ForEveryone.Heroes.Domain;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;
using ForEveryone.Heroes.Application.Exceptions;

namespace ForEveryone.Heroes.Application.Battles;

/// <summary>
/// Construye el estado de combate que ve el cliente a partir del heroe y de la
/// batalla. La forma de calcularlo (reproduccion determinista) la decide
/// <see cref="BattleEngine"/>; aqui solo se proyecta al contrato de la API.
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
        var replay = BattleEngine.Replay(hero.Stats, battle.HeroHealthAtStart, enemy, actions);

        var message = replay.Finished
            ? replay.Victory
                ? $"¡Victoria contra {enemy.Name}! Ganaste {replay.ExperienceGained} de experiencia y {replay.GoldGained} de oro."
                : $"Has sido derrotado por {enemy.Name}. Tu héroe necesita descansar."
            : $"Turno {replay.Rounds.Count + 1}: elige cómo atacar.";

        return new BattleStateDto(
            battle.Id,
            enemy.Key,
            enemy.Name,
            replay.Rounds.Count,
            replay.EnemyHealth,
            enemy.Health,
            enemy.Attack,
            enemy.Defense,
            replay.HeroHealth,
            hero.Stats.Health,
            hero.Stats.Attack,
            hero.Stats.Defense,
            replay.Finished,
            replay.Victory,
            // Las recompensas solo se muestran una vez aplicado el cierre, para
            // que el cliente no las announces antes de tiempo.
            applyRewards ? replay.ExperienceGained : 0,
            applyRewards ? replay.GoldGained : 0,
            BuildActions(hero, enemy, actions, replay.Finished),
            replay.Rounds
                .Select(r => new BattleRoundDto(
                    r.Round, r.Action, r.HeroDamage, r.EnemyDamage,
                    r.EnemyHealthRemaining, r.HeroHealthRemaining, r.Message))
                .ToList(),
            message);
    }

    private static IReadOnlyList<BattleActionDto> BuildActions(
        Hero hero, Enemy enemy, IReadOnlyList<BattleAction> actions, bool finished)
    {
        if (finished) return [];

        var usesLeft = BattleEngine.SkillUsesLeft(actions);

        return
        [
            new BattleActionDto(
                BattleAction.Attack,
                "Ataque normal",
                $"Golpe basico de {hero.Stats.Attack} de ataque.",
                BattleEngine.DamageFor(BattleAction.Attack, hero.Stats, enemy),
                BattleEngine.IsAvailable(BattleAction.Attack, actions),
                usesLeft),
            new BattleActionDto(
                BattleAction.PowerStrike,
                "Golpe poderoso",
                $"Golpe de {hero.Stats.Attack * 2} de ataque. Quedan {usesLeft} de {BattleEngine.SkillUsesPerBattle} usos.",
                BattleEngine.DamageFor(BattleAction.PowerStrike, hero.Stats, enemy),
                BattleEngine.IsAvailable(BattleAction.PowerStrike, actions),
                usesLeft)
        ];
    }
}
