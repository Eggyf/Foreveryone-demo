namespace ForEveryone.SharedKernel;

/// <summary>
/// Texto que el cliente tiene que traducir, en lugar de un texto ya redactado.
///
/// El servidor no sabe en que idioma lee el jugador, asi que devuelve la clave
/// del mensaje y los argumentos ya resueltos. El cliente la busca en su
/// diccionario y la interpola. Asi el mismo combate se cuenta en castellano o
/// en ingles sin que el servidor tenga que saber el idioma.
///
/// Los argumentos llegan ya formateados porque son datos: un contador de turnos
/// o una cantidad de maná no se traducen, se sustituyen.
/// </summary>
public sealed record LocalizedText(string Key, IReadOnlyDictionary<string, string> Args)
{
    /// <summary>Mensaje sin argumentos, para la mayoria de los casos.</summary>
    public static LocalizedText Of(string key) => new(key, new Dictionary<string, string>());

    /// <summary>
    /// Mensaje con argumentos. Los valores son texto o claves de traduccion
    /// anidadas: un nombre de habilidad o de enemigo viaja como clave, para que
    /// el cliente lo traduzca antes de insertarlo en el mensaje.
    /// </summary>
    public static LocalizedText Of(string key, params (string Name, object Value)[] args) =>
        new(
            key,
            args.ToDictionary(
                a => a.Name,
                a => a.Value is int number
                    ? number.ToString(System.Globalization.CultureInfo.InvariantCulture)
                    : a.Value.ToString() ?? string.Empty));

    /// <summary>
    /// Message with numeric arguments. Convenience for the common case in which
    /// every argument is a number; mixed arguments go through
    /// <see cref="Of(string, (string, object)[])"/>.
    /// </summary>
    public static LocalizedText OfNumbers(string key, params (string Name, int Value)[] args) =>
        Of(key, args.Select(a => (a.Name, (object)a.Value)).ToArray());
}