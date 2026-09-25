using FluentValidation;
using MediatR;

namespace ForEveryone.Heroes.Application.Common.Behaviors;

/// <summary>
/// Ejecuta los validators de FluentValidation registrados para el TRequest antes
/// de que llegue al Handler. Sin este behavior los validators nunca se invocan:
/// se registran con AddValidatorsFromAssembly pero MediatR no los encadena por
/// si solo. Evita que un valor invalido llegue al dominio y reviente con un 500.
/// </summary>
public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
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

        // Fully qualified: FluentValidation tambien define ValidationException.
        throw new Exceptions.ValidationException(
            failures.Select(failure => failure.ErrorMessage));
    }
}
