using ForEveryone.SharedKernel;

namespace ForEveryone.Kingdom.Application.Exceptions;

/// <summary>
/// Conflicto con el estado actual del recurso. Como
/// <see cref="NotFoundException"/>, el texto es una clave que traduce el cliente.
/// </summary>
public class ConflictException : Exception
{
    public LocalizedText Text { get; }

    public ConflictException(LocalizedText text) : base(text.Key) => Text = text;

    public ConflictException(string key) : this(LocalizedText.Of(key)) { }
}