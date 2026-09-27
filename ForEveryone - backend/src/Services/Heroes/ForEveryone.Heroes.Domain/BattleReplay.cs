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
    int HeroMana,
    IReadOnlyList<CombatRound> Rounds,
    int ExperienceGained,
    int GoldGained);
