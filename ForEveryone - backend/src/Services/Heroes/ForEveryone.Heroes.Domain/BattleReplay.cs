namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Estado de una batalla reconstruido a partir de las acciones jugadas.
/// Lo devuelve <see cref="BattleEngine.Replay"/>; no se persiste.
/// </summary>
public sealed record BattleReplay(
    bool Victory,
    bool Finished,
    int EnemyHealth,
    int HeroHealth,
    IReadOnlyList<CombatRound> Rounds,
    int ExperienceGained,
    int GoldGained);

/// <summary>
/// Una accion disponible en el turno actual, con el dano exacto que haria.
/// Mostrar el numero evita que el jugador elija a ciegas.
/// </summary>
public sealed record BattleActionOption(
    BattleAction Action,
    string Name,
    string Description,
    int Damage,
    bool Available,
    int UsesLeft);
