using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Application.Exceptions;

/// <summary>
/// Se lanza cuando un comando o query no supera las reglas de FluentValidation.
/// El controlador la traduce a un 400 con el detalle de cada fallo.
///
/// Los validators escriben claves de traduccion en lugar de frases, asi que
/// <see cref="Errors"/> las lleva tal cual y el cliente las resuelve en su
/// idioma. Los argumentos por defecto son los nombres de la propiedad, para que
/// un mensaje pueda mencionar el campo sin que el validator tenga que repetirlo.
/// </summary>
public class ValidationException : Exception
{
    public IReadOnlyList<LocalizedText> Errors { get; }

    public ValidationException(IEnumerable<LocalizedText> errors)
        : base(string.Join(" | ", errors.Select(error => error.Key))) => Errors = errors.ToList();
}