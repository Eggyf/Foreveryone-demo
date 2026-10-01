using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Application.Exceptions;

/// <summary>
/// Conflicto con el estado actual del recurso: ya existe, o la operacion no es
/// valida en este momento. Como <see cref="NotFoundException"/>, el texto es una
/// clave que traduce el cliente.
/// </summary>
public class ConflictException : Exception
{
    public LocalizedText Text { get; }

    public ConflictException(LocalizedText text) : base(text.Key) => Text = text;

    public ConflictException(string key) : this(LocalizedText.Of(key)) { }

    public ConflictException(LocalizedText text, string logMessage) : base(logMessage) => Text = text;
}