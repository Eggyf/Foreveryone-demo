namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Enemigo contra el que puede luchar el heroe. Es un Value Object: dos
/// enemigos con los mismos valores son el mismo enemigo.
/// <para>
/// <see cref="Key"/> es el identificador estable que usa el cliente, mientras
/// que <see cref="NameKey"/> es solo la clave del nombre visible: el texto lo
/// traduce el cliente, porque el dominio no sabe en que idioma se juega.
/// </para>
/// <para>
/// <see cref="ZoneKey"/> apunta a la zona de <see cref="ZoneCatalog"/> que lo
/// alberga. No decide nada del combate: el motor sigue resolviendo el enemigo con
/// <see cref="EnemyCatalog.FindByKey"/>.
/// </para>
/// </summary>
public sealed record Enemy(
    string Key,
    string ZoneKey,
    string NameKey,
    int Health,
    int Attack,
    int Defense,
    int ExperienceReward,
    int GoldReward)
{
    // --- Bosque: la zona de entrada. Se recorre con un heroe recien creado. ---

    public static readonly Enemy Goblin =
        new("goblin", "forest", "enemy.goblin", 50, 12, 5, 40, 20);

    public static readonly Enemy GiantSpider =
        new("spider", "forest", "enemy.spider", 85, 19, 8, 75, 40);

    public static readonly Enemy Treant =
        new("treant", "forest", "enemy.treant", 140, 26, 16, 140, 85);

    // --- Cavernas: mas vida y mas defensa. Para un heroe de nivel 3 o mas. ---

    public static readonly Enemy GiantBat =
        new("bat", "caverns", "enemy.bat", 95, 21, 7, 90, 50);

    public static readonly Enemy GreedySlime =
        new("slime", "caverns", "enemy.slime", 150, 24, 12, 160, 95);

    public static readonly Enemy Troll =
        new("troll", "caverns", "enemy.troll", 210, 33, 20, 240, 150);

    // --- Ruinas: la zona dura. El golem es el que un heroe de nivel 1 no puede
    //     ganar, y por eso la zona declara un nivel recomendado de 5. ---

    public static readonly Enemy Skeleton =
        new("skeleton", "ruins", "enemy.skeleton", 170, 28, 15, 200, 120);

    public static readonly Enemy Wraith =
        new("wraith", "ruins", "enemy.wraith", 230, 37, 18, 300, 190);

    public static readonly Enemy ObsidianGolem =
        new("golem", "ruins", "enemy.golem", 300, 44, 26, 420, 280);
}

/// <summary>
/// Catalogo de enemigos disponibles. Vive en el dominio para que las
/// recompensas y las estadisticas no se dupliquen en el cliente.
/// <para>
/// El orden es tambien el de dificultad, y de paso el que presenta el mapa
/// dentro de cada zona.
/// </para>
/// </summary>
public static class EnemyCatalog
{
    public static IReadOnlyList<Enemy> All { get; } =
    [
        Enemy.Goblin,
        Enemy.GiantSpider,
        Enemy.Treant,
        Enemy.GiantBat,
        Enemy.GreedySlime,
        Enemy.Troll,
        Enemy.Skeleton,
        Enemy.Wraith,
        Enemy.ObsidianGolem
    ];

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