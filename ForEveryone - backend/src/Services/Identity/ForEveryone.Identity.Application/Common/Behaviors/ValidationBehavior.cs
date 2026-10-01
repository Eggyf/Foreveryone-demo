using ForEveryone.SharedKernel;
using FluentValidation;
using MediatR;

namespace ForEveryone.Identity.Application.Common.Behaviors;

/// <summary>
/// Corre todos los validators de FluentValidation registrados para el TRequest
/// ANTES de que el Command/Query llegue a su Handler. Si falla, ni siquiera
/// se toca el dominio: se devuelve un Result fallido con el error de validacion.
/// Aplica el principio Single Responsibility: los handlers ya no validan nada.
///
/// Los validators escriben claves de traduccion en `WithMessage`, no frases: el
/// <see cref="Error"/> que sale lleva la clave consolidada en
/// <see cref="Error.Description"/> y la lista completa en `args`, para que el
/// cliente la resuelva en el idioma del jugador.
/// </summary>
public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : Result
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators) => _validators = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var failures = _validators
            .Select(validator => validator.Validate(request))
            .SelectMany(result => result.Errors)
            .Where(failure => failure is not null)
            .ToList();

        if (failures.Count == 0)
            return await next();

        // Un mismo campo puede fallar en varias reglas ("contrasena" incumple a la
        // vez la longitud y el requisito de mayuscula), asi que ToDictionary
        // reventaria con clave duplicada. Se agrupa en una lista por campo.
        var details = new Dictionary<string, string>();

        foreach (var group in failures.GroupBy(failure => failure.PropertyName))
        {
            details[group.Key] = string.Join(" | ", group.Select(f => f.ErrorMessage));
        }

        var error = new Error(
            "Validation.Failed",
            string.Join(" | ", failures.Select(f => f.ErrorMessage)),
            details);

        return CreateFailureResult(error);
    }

    /// <summary>
    /// TResponse puede ser Result o Result&lt;T&gt;. Como no sabemos T en tiempo de
    /// compilacion dentro de este behavior generico, usamos reflexion una sola vez
    /// para construir el Result.Failure&lt;T&gt; correcto.
    /// </summary>
    private static TResponse CreateFailureResult(Error error)
    {
        if (typeof(TResponse) == typeof(Result))
            return (TResponse)(object)Result.Failure(error);

        var innerType = typeof(TResponse).GetGenericArguments()[0];

        var failureMethod = typeof(Result)
            .GetMethods()
            .First(m => m.Name == nameof(Result.Failure) && m.IsGenericMethod)
            .MakeGenericMethod(innerType);

        return (TResponse)failureMethod.Invoke(null, new object[] { error })!;
    }
}