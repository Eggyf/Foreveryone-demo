using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Application.Exceptions;

/// <summary>
/// Recurso que no existe. El texto es una clave de traduccion que resuelve el
/// cliente, no una frase redactada aqui.
/// </summary>
public class NotFoundException : Exception
{
    public LocalizedText Text { get; }

    public NotFoundException(LocalizedText text) : base(text.Key) => Text = text;

    public NotFoundException(string key) : this(LocalizedText.Of(key)) { }

    public NotFoundException(LocalizedText text, string logMessage) : base(logMessage) => Text = text;
}