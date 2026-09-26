namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Resultado de una batalla ya resuelta. Incluye el historial completo de
/// turnos para que el cliente muestre la pelea sin tener que simularla.
/// </summary>
/// <param name="Victory">True si el heroe gano.</param>
/// <param name="Enemy">Enemigo derrotado.</param>
/// <param name="Rounds">Turnos jugados, en orden.</param>
/// <param name="ExperienceGained">Experiencia ganada; 0 en derrota.</param>
/// <param name="GoldGained">Oro ganado; 0 en derrota.</param>
/// <param name="LevelBefore">Nivel del heroe antes del combate.</param>
/// <param name="LevelAfter">Nivel del heroe tras el combate.</param>
/// <param name="Message">Resumen final para el jugador.</param>
public sealed record BattleOutcome(
    bool Victory,
    Enemy Enemy,
    IReadOnlyList<CombatRound> Rounds,
    int ExperienceGained,
    int GoldGained,
    int LevelBefore,
    int LevelAfter,
    string Message);
