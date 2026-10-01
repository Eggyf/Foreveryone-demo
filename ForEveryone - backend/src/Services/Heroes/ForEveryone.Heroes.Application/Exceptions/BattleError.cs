using ForEveryone.SharedKernel;

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
///
/// El mensaje es un <see cref="LocalizedText"/>: el controlador lo devuelve tal
/// cual y el cliente lo traduce. <see cref="Message"/> queda para el log del
/// servidor.
/// </summary>
public sealed class BattleError : Exception
{
    public BattleErrorKind Kind { get; }

    /// <summary>Clave y argumentos con los que el cliente reconstruye el texto.</summary>
    public LocalizedText Text { get; }

    public IReadOnlyList<LocalizedText> Errors { get; }

    public BattleError(
        BattleErrorKind kind,
        LocalizedText text,
        IReadOnlyList<LocalizedText>? errors = null,
        string? logMessage = null)
        : base(logMessage ?? text.Key)
    {
        Kind = kind;
        Text = text;
        Errors = errors ?? [];
    }

    public static BattleError NotFound(LocalizedText text) =>
        new(BattleErrorKind.NotFound, text);

    public static BattleError Conflict(LocalizedText text) =>
        new(BattleErrorKind.Conflict, text);

    /// <summary>
    /// Variante con mensaje para el log del servidor: la clave que ve el jugador
    /// no explica en castellano qué paso, y el log si lo necesita.
    /// </summary>
    public static BattleError Conflict(LocalizedText text, string logMessage) =>
        new(BattleErrorKind.Conflict, text, null, logMessage);

    public static BattleError Invalid(LocalizedText text, IReadOnlyList<LocalizedText>? errors = null) =>
        new(BattleErrorKind.Invalid, text, errors);
}