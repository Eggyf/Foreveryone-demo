namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Un turno completo de combate: el heroe golpea y, si sobrevive, el enemigo
/// contraataca. Se devuelve como parte de <see cref="BattleOutcome"/> para que
/// el cliente pueda reconstruir la pelea turno a turno.
/// </summary>
/// <param name="Round">Numero de turno, empezando en 1.</param>
/// <param name="HeroDamage">Dano que el heroe infirgio en este turno.</param>
/// <param name="EnemyDamage">Dano que infirgio el enemigo; 0 si ya murio.</param>
/// <param name="EnemyHealthRemaining">Vida del enemigo tras el turno.</param>
/// <param name="HeroHealthRemaining">Vida del heroe tras el turno.</param>
/// <param name="Message">Descripcion legible del turno.</param>
public sealed record CombatRound(
    int Round,
    int HeroDamage,
    int EnemyDamage,
    int EnemyHealthRemaining,
    int HeroHealthRemaining,
    string Message);
