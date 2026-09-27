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
    int HeroMana,
    int HeroMaxMana,
    int HeroAttack,
    int HeroDefense,
    bool Finished,
    bool Victory,
    int ExperienceGained,
    int GoldGained,
    IReadOnlyList<BattleActionDto> Actions,
    IReadOnlyList<BattleRoundDto> Rounds,
    string Message);

/// <summary>
/// Una accion del kit de la clase del heroe. El nombre, el coste y el efecto
/// los decide el servidor, de modo que el cliente no tiene una tabla de
/// habilidades propia que pueda desincronizarse.
/// </summary>
/// <param name="Action">Ranura jugada: 1 basico, 2 habilidad, 3 exclusiva.</param>
/// <param name="Name">Nombre visible, propio de la clase.</param>
/// <param name="Description">Explicacion de una linea.</param>
/// <param name="Damage">Dano exacto que haria contra este enemigo; 0 si no golpea.</param>
/// <param name="ManaCost">Maná que cuesta, ya redondeado a un entero.</param>
/// <param name="Available">Si se puede jugar en este turno.</param>
/// <param name="UsesLeft">Usos restantes; -1 si la accion no tiene limite.</param>
/// <param name="UsesLimit">Usos por combate; 0 si no tiene limite.</param>
/// <param name="UnavailableReason">Por que no se puede jugar; null si si se puede.</param>
public record BattleActionDto(
    BattleAction Action,
    string Name,
    string Description,
    int Damage,
    int ManaCost,
    bool Available,
    int UsesLeft,
    int UsesLimit,
    string UnavailableReason);

public record BattleRoundDto(
    int Round,
    BattleAction Action,
    int HeroDamage,
    int EnemyDamage,
    int EnemyHealthRemaining,
    int HeroHealthRemaining,
    int HeroManaRemaining,
    string Message);
