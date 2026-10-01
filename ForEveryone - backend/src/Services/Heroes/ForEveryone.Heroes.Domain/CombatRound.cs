using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Un turno ya resuelto del combate.
///
/// El <see cref="Message"/> no es una frase redactada sino la clave de traduccion
/// con los numeros ya resueltos, porque el dominio no sabe en que idioma lee el
/// jugador. El log se reconstruye reproduciendo el combate, asi que cambiar el
/// idioma no obliga a rehacer ni una batalla guardada.
/// </summary>
public sealed record CombatRound(
    int Round,
    BattleAction Action,
    int HeroDamage,
    int EnemyDamage,
    int EnemyHealthRemaining,
    int HeroHealthRemaining,
    int HeroManaRemaining,
    LocalizedText Message);