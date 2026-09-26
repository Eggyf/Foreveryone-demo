using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.FightBattle;

/// <summary>
/// Lanza una batalla contra el enemigo indicado por <paramref name="EnemyKey"/>.
/// </summary>
public record FightBattleCommand(Guid UserId, string EnemyKey) : IRequest<FightBattleResult>;

public record FightBattleResult(
    bool Victory,
    string EnemyKey,
    string EnemyName,
    int EnemyHealth,
    int EnemyAttack,
    int EnemyDefense,
    IReadOnlyList<BattleRoundResult> Rounds,
    int ExperienceGained,
    int GoldGained,
    int LevelBefore,
    int LevelAfter,
    string Message);

public record BattleRoundResult(
    int Round,
    int HeroDamage,
    int EnemyDamage,
    int EnemyHealthRemaining,
    int HeroHealthRemaining,
    string Message);
