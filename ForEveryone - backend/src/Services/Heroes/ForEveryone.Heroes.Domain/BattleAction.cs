namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Acciones que el jugador puede elegir en su turno.
/// </summary>
public enum BattleAction
{
    /// <summary>Ataque basico: no consume nada y siempre esta disponible.</summary>
    Attack = 1,

    /// <summary>Habilidad de golpe fuerte: hace mas dano pero tiene un limite de usos por combate.</summary>
    PowerStrike = 2
}
