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

    private Battle(Guid id, Guid heroId, Enemy enemy, int heroHealthAtStart, int heroManaAtStart)
    {
        Id = id;
        HeroId = heroId;
        EnemyKey = enemy.Key;
        HeroHealthAtStart = heroHealthAtStart;
        HeroManaAtStart = heroManaAtStart;
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

    /// <summary>
    /// Maná del heroe al empezar el combate. Se guarda por el mismo motivo que la
    /// vida: el motor lo va descontando turno a turno al pagar cada habilidad, y
    /// reproducir la pelea desde el principio necesita el valor de partida, no
    /// el actual.
    /// </summary>
    public int HeroManaAtStart { get; private set; }

    public BattleStatus Status { get; private set; }

    public bool IsFinished => Status != BattleStatus.InProgress;

    public IReadOnlyList<BattleAction> Actions
    {
        get
        {
            if (string.IsNullOrWhiteSpace(_actionsCsv)) return [];

            var actions = new List<BattleAction>();

            // Se ignoran las entradas que no se reconocen en vez de lanzar: una
            // fila corrupta no debe impedir abrir el combate, y el motor ya
            // cae al ataque basico si le llega una ranura ajena al kit.
            foreach (var value in _actionsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries))
            {
                if (Enum.TryParse<BattleAction>(value, out var action))
                {
                    actions.Add(action);
                }
            }

            return actions;
        }
    }

    public static Battle Start(Guid heroId, Enemy enemy, int heroHealthAtStart, int heroManaAtStart)
    {
        ArgumentNullException.ThrowIfNull(enemy);

        if (heroHealthAtStart <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(heroHealthAtStart), "No se puede empezar un combate con el heroe derrotado.");

        return new Battle(Guid.NewGuid(), heroId, enemy, heroHealthAtStart, heroManaAtStart);
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
