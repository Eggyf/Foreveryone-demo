namespace ForEveryone.Heroes.Application.Exceptions;

public enum BattleErrorKind
{
    Invalid = 0,
    NotFound = 1,
    Conflict = 2
}

/// <summary>
/// Error de una operacion de combate. Agrupa los casos con su codigo HTTP para
/// que el controlador tenga un unico punto de traduccion en lugar de tres
/// bloques catch por endpoint.
/// </summary>
public sealed class BattleError : Exception
{
    public BattleErrorKind Kind { get; }

    public IReadOnlyList<string> Errors { get; }

    public BattleError(BattleErrorKind kind, string message, IReadOnlyList<string>? errors = null)
        : base(message)
    {
        Kind = kind;
        Errors = errors ?? [];
    }

    public static BattleError NotFound(string message) => new(BattleErrorKind.NotFound, message);

    public static BattleError Conflict(string message) => new(BattleErrorKind.Conflict, message);

    public static BattleError Invalid(string message, IReadOnlyList<string>? errors = null) =>
        new(BattleErrorKind.Invalid, message, errors);
}
