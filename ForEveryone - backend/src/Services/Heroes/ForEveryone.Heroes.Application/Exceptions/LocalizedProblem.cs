using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Application.Exceptions;

/// <summary>
/// Cuerpo de error con la informacion que necesita el cliente para pintar el
/// mensaje en su idioma.
///
/// Los cuatro servicios no comparten una unica forma de error, asi que cada
/// uno devuelve la suya; lo que comparten es que el texto viaja como clave y
/// argumentos. Este record es el que ambos formatos usan por dentro, para que el
/// cliente tenga un solo punto donde mirar.
/// </summary>
public sealed record LocalizedProblem(LocalizedText Detail, IReadOnlyList<LocalizedText>? Errors = null);