namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Region del reino que agrupa enemigos. Es un Value Object: dos zonas con los
/// mismos valores son la misma zona.
/// <para>
/// <see cref="Key"/> es el identificador estable que usa el cliente, mientras que
/// <see cref="NameKey"/> y <see cref="DescriptionKey"/> son solo claves: el texto
/// lo traduce el cliente, porque el dominio no sabe en que idioma se juega. Las
/// dos cuelgan del mismo prefijo de zona (<c>zone.forest.name</c> y
/// <c>zone.forest.desc</c>) para que el cliente las guarde juntas.
/// </para>
/// <para>
/// <see cref="RecommendedLevel"/> no bloquea nada, solo orienta. Las zonas estan
/// todas abiertas desde el principio, asi que el cliente lo muestra como
/// informacion para que un heroe de nivel bajo sepa que se va a encontrar.
/// </para>
/// </summary>
public sealed record Zone(
    string Key,
    string NameKey,
    string DescriptionKey,
    int RecommendedLevel)
{
    public static readonly Zone Forest =
        new("forest", "zone.forest.name", "zone.forest.desc", 1);

    public static readonly Zone Caverns =
        new("caverns", "zone.caverns.name", "zone.caverns.desc", 3);

    public static readonly Zone Ruins =
        new("ruins", "zone.ruins.name", "zone.ruins.desc", 5);
}

/// <summary>
/// Catalogo de zonas y de los enemigos que las habitan. El orden de
/// <see cref="All"/> es el orden en que el mapa las presenta, asi que no hay un
/// campo de orden que se pueda desincronizar de la lista.
/// </summary>
public static class ZoneCatalog
{
    public static IReadOnlyList<Zone> All { get; } =
        [Zone.Forest, Zone.Caverns, Zone.Ruins];

    /// <summary>
    /// Busca una zona por su clave. La comparacion no distingue mayusculas para
    /// que el cliente no tenga que respetar la caja.
    /// </summary>
    public static Zone? FindByKey(string? key) =>
        string.IsNullOrWhiteSpace(key)
            ? null
            : All.FirstOrDefault(
                zone => string.Equals(zone.Key, key.Trim(), StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Enemigos de una zona, conservando el orden de <see cref="EnemyCatalog.All"/>,
    /// que es el orden de dificultad dentro de la zona.
    /// </summary>
    public static IReadOnlyList<Enemy> EnemiesIn(Zone zone) =>
        EnemyCatalog.All
            .Where(enemy =>
                string.Equals(enemy.ZoneKey, zone.Key, StringComparison.OrdinalIgnoreCase))
            .ToList();
}