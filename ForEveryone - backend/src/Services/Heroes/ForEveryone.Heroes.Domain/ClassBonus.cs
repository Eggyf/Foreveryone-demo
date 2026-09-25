namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Estadisticas base de cada clase, antes de aplicar el <see cref="RaceBonus"/>.
/// Es la unica fuente de la tabla de balance de clases.
/// </summary>
public static class ClassBonus
{
    public static HeroStats For(HeroClass heroClass) => heroClass switch
    {
        HeroClass.Warrior => new HeroStats(150, 15, 20, 10),
        HeroClass.Hunter => new HeroStats(100, 20, 10, 20),
        HeroClass.Wizard => new HeroStats(80, 25, 5, 50),
        HeroClass.Rogue => new HeroStats(90, 18, 12, 15),
        _ => throw new ArgumentOutOfRangeException(
            nameof(heroClass), heroClass, "Clase desconocida.")
    };
}
