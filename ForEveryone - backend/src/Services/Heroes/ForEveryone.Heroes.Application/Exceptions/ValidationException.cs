namespace ForEveryone.Heroes.Application.Exceptions;

/// <summary>
/// Se lanza cuando un comando o query no supera las reglas de FluentValidation.
/// El controlador la traduce a un 400 con el detalle de cada fallo.
/// </summary>
public class ValidationException : Exception
{
    public IReadOnlyList<string> Errors { get; }

    public ValidationException(IEnumerable<string> errors)
        : base(string.Join(" | ", errors)) => Errors = errors.ToList();
}
