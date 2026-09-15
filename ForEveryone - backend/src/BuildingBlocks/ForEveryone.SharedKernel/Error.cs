namespace ForEveryone.SharedKernel;

/// <summary>
/// Representa un error de negocio (no una excepcion). Se usa junto con Result/Result&lt;T&gt;
/// para modelar fallos esperados del dominio sin recurrir a excepciones para control de flujo.
/// </summary>
public sealed record Error(string Code, string Description)
{
    public static readonly Error None = new(string.Empty, string.Empty);
}
