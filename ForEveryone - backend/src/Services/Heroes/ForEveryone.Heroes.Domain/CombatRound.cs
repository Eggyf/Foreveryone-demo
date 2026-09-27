namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Un turno completo: el heroe elige una accion y, si sobrevive, el enemigo
/// contraataca.
/// </summary>
/// <param name="Round">Numero de turno, empezando en 1.</param>
/// <param name="Action">Ranura elegida por el jugador.</param>
/// <param name="HeroDamage">Dano que el heroe infirgio en este turno.</param>
/// <param name="EnemyDamage">Dano que infirgio el enemigo; 0 si ya murio.</param>
/// <param name="EnemyHealthRemaining">Vida del enemigo tras el turno.</param>
/// <param name="HeroHealthRemaining">Vida del heroe tras el turno.</param>
/// <param name="HeroManaRemaining">Maná del heroe tras el turno.</param>
/// <param name="Message">Descripcion legible del turno.</param>
public sealed record CombatRound(
    int Round,
    BattleAction Action,
    int HeroDamage,
    int EnemyDamage,
    int EnemyHealthRemaining,
    int HeroHealthRemaining,
    int HeroManaRemaining,
    string Message);
