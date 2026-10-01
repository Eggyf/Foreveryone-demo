namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Enemigo contra el que puede luchar el heroe. Es un Value Object: dos
/// enemigos con los mismos valores son el mismo enemigo.
/// <para>
/// <see cref="Key"/> es el identificador estable que usa el cliente, mientras
/// que <see cref="NameKey"/> es solo la clave del nombre visible: el texto lo
/// traduce el cliente, porque el dominio no sabe en que idioma se juega.
/// </para>
/// </summary>
public sealed record Enemy(
    string Key,
    string NameKey,
    int Health,
    int Attack,
    int Defense,
    int ExperienceReward,
    int GoldReward)
{
    public static readonly Enemy Goblin =
        new("goblin", "enemy.goblin", 50, 12, 5, 40, 20);

    public static readonly Enemy Wolf =
        new("wolf", "enemy.wolf", 90, 20, 8, 80, 45);

    public static readonly Enemy Ogre =
        new("ogre", "enemy.ogre", 150, 30, 14, 150, 90);
}

/// <summary>
/// Catalogo de enemigos disponibles. Vive en el dominio para que las
/// recompensas y las estadisticas no se dupliquen en el cliente.
/// </summary>
public static class EnemyCatalog
{
    public static IReadOnlyList<Enemy> All { get; } =
        [Enemy.Goblin, Enemy.Wolf, Enemy.Ogre];

    /// <summary>
    /// Busca un enemigo por su clave. La comparacion no distingue mayusculas
    /// para que el cliente no tenga que respetar la caja.
    /// </summary>
    public static Enemy? FindByKey(string? key) =>
        string.IsNullOrWhiteSpace(key)
            ? null
            : All.FirstOrDefault(
                enemy => string.Equals(enemy.Key, key.Trim(), StringComparison.OrdinalIgnoreCase));
}
