namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Value Object con los modificadores porcentuales que una <see cref="Race"/>
/// aplica sobre las estadisticas base de la clase. Los porcentajes pueden ser
/// negativos, por lo que una raza tambien puede penalizar.
/// </summary>
public sealed record RaceBonus(
    int HealthPercent,
    int AttackPercent,
    int DefensePercent,
    int ManaPercent)
{
    /// <summary>
    /// Modificadores de cada raza. El Humano es el equilibrio: no obtiene
    /// bonificacion ni penalizacion en ninguna estadistica.
    /// </summary>
    public static RaceBonus For(Race race) => race switch
    {
        Race.Humano => new RaceBonus(0, 0, 0, 0),
        Race.Elfo => new RaceBonus(0, 10, -10, 10),
        Race.Enano => new RaceBonus(20, -10, 20, 0),
        Race.Orco => new RaceBonus(15, 15, -15, -20),
        _ => throw new ArgumentOutOfRangeException(nameof(race), race, "Raza desconocida.")
    };

    public HeroStats Apply(HeroStats baseStats) => baseStats with
    {
        Health = Scale(baseStats.Health, HealthPercent),
        Attack = Scale(baseStats.Attack, AttackPercent),
        Defense = Scale(baseStats.Defense, DefensePercent),
        Mana = Scale(baseStats.Mana, ManaPercent)
    };

    /// <summary>
    /// Aplica el porcentaje y garantiza un minimo de 1 punto, de forma que un
    /// penalizador nunca deje una estadistica inutilizable.
    /// </summary>
    private static int Scale(int value, int percent) =>
        Math.Max(1, value + (value * percent / 100));
}
