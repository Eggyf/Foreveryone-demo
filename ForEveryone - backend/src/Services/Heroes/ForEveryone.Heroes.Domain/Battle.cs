namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Combate en curso entre un heroe y un enemigo. Se persiste lo justo para
/// poder reconstruir la pelea: como el combate es determinista, la secuencia
/// de acciones jugadas ES el estado. No hace falta guardar cada turno, lo que
/// evita que la partida guardada se desincronice del heroe.
/// Es una clase plana con identidad propia, igual que <see cref="Hero"/>, que es
/// el estilo que sigue este servicio.
/// </summary>
public sealed class Battle
{
    /// <summary>Acciones jugadas, separadas por coma, para persistir en una sola columna.</summary>
    private string _actionsCsv = string.Empty;

    // Constructor privado sin parametros requerido por EF Core.
    private Battle() => _actionsCsv = string.Empty;

    private Battle(Guid id, Guid heroId, Enemy enemy, int heroHealthAtStart)
    {
        Id = id;
        HeroId = heroId;
        EnemyKey = enemy.Key;
        HeroHealthAtStart = heroHealthAtStart;
        Status = BattleStatus.InProgress;
    }

    public Guid Id { get; private set; }

    public Guid HeroId { get; private set; }

    public string EnemyKey { get; private set; } = null!;

    /// <summary>
    /// Vida del heroe al empezar el combate. Se guarda porque el dominio la va
    /// descontando turno a turno, asi que la actual ya no sirve para reproducir
    /// la pelea desde el principio.
    /// </summary>
    /// <summary>
    /// Columna donde se persisten las acciones jugadas. Es interna para que
    /// EF Core pueda mapearla sin exponerla como parte del contrato del dominio.
    /// </summary>
    internal string ActionsCsv
    {
        get => _actionsCsv;
        set => _actionsCsv = value;
    }

    public int HeroHealthAtStart { get; private set; }

    public BattleStatus Status { get; private set; }

    public bool IsFinished => Status != BattleStatus.InProgress;

    public IReadOnlyList<BattleAction> Actions
    {
        get
        {
            if (string.IsNullOrWhiteSpace(_actionsCsv)) return [];

            return _actionsCsv
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(value => Enum.Parse<BattleAction>(value))
                .ToList();
        }
    }

    public static Battle Start(Guid heroId, Enemy enemy, int heroHealthAtStart)
    {
        ArgumentNullException.ThrowIfNull(enemy);

        if (heroHealthAtStart <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(heroHealthAtStart), "No se puede empezar un combate con el heroe derrotado.");

        return new Battle(Guid.NewGuid(), heroId, enemy, heroHealthAtStart);
    }

    /// <summary>
    /// Registra la accion elegida en este turno. No decide el resultado: eso
    /// lo calcula <see cref="BattleEngine"/> reproduciendo la secuencia.
    /// </summary>
    public void Play(BattleAction action)
    {
        if (IsFinished)
            throw new InvalidOperationException("El combate ya ha terminado.");

        var actions = Actions.ToList();
        actions.Add(action);

        _actionsCsv = string.Join(',', actions);
    }

    public void Finish(bool victory) =>
        Status = victory ? BattleStatus.Won : BattleStatus.Lost;
}
