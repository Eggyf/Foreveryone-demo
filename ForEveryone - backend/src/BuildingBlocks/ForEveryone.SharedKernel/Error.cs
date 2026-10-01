namespace ForEveryone.SharedKernel;

/// <summary>
/// Representa un error de negocio (no una excepcion). Se usa junto con Result/Result&lt;T&gt;
/// para modelar fallos esperados del dominio sin recurrir a excepciones para control de flujo.
///
/// <paramref name="Description"/> lleva texto legible para el log del servidor.
/// <paramref name="Details"/> es lo que ve el cliente: la clave de traduccion y
/// sus argumentos, indexados por el campo que fallo. El cliente decide como
/// pintar cada uno, y por eso los validators escriben claves en lugar de frases.
/// </summary>
public sealed record Error(string Code, string Description, IReadOnlyDictionary<string, string>? Details = null)
{
    public static readonly Error None = new(string.Empty, string.Empty);
}