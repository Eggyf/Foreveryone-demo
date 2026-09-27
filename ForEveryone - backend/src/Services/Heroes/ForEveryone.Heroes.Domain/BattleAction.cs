namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Ranuras de accion que el jugador puede elegir en su turno. No son
/// habilidades concretas: cada clase las rellena con su propio kit, definido en
/// <see cref="ClassAbilities"/>. El nombre que ve el jugador lo decide ese
/// catalogo, no este enum.
///
/// Los valores no se renombran porque la secuencia de acciones se persiste como
/// texto (<c>Battle.ActionsCsv</c>) y los combates en curso que ya existen en la
/// base de datos tienen que seguir reinterpretandose igual.
/// </summary>
public enum BattleAction
{
    /// <summary>Ataque basico de la clase: gratis, ilimitado y siempre disponible.</summary>
    Attack = 1,

    /// <summary>Habilidad caracteristica de la clase, con limite de usos por combate.</summary>
    PowerStrike = 2,

    /// <summary>Accion exclusiva de la clase, con un efecto propio y limite de usos.</summary>
    Special = 3
}
