using ForEveryone.Heroes.Domain;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;

public record StartBattleCommand(Guid UserId, string EnemyKey) : IRequest<BattleStateDto>;

/// <summary>
/// Estado completo de un combate, tal y como lo necesita el cliente para
/// dibujar la pantalla y decidir que acciones puede pulsar.
/// </summary>
public record BattleStateDto(
    Guid BattleId,
    string EnemyKey,
    string EnemyName,
    int Round,
    int EnemyHealth,
    int EnemyMaxHealth,
    int EnemyAttack,
    int EnemyDefense,
    int HeroHealth,
    int HeroMaxHealth,
    int HeroAttack,
    int HeroDefense,
    bool Finished,
    bool Victory,
    int ExperienceGained,
    int GoldGained,
    IReadOnlyList<BattleActionDto> Actions,
    IReadOnlyList<BattleRoundDto> Rounds,
    string Message);

public record BattleActionDto(
    BattleAction Action,
    string Name,
    string Description,
    int Damage,
    bool Available,
    int UsesLeft);

public record BattleRoundDto(
    int Round,
    BattleAction Action,
    int HeroDamage,
    int EnemyDamage,
    int EnemyHealthRemaining,
    int HeroHealthRemaining,
    string Message);
