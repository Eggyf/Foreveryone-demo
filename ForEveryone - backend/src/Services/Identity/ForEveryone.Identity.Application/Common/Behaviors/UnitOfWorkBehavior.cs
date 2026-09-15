using ForEveryone.Identity.Application.Common.Interfaces;
using ForEveryone.SharedKernel;
using MediatR;

namespace ForEveryone.Identity.Application.Common.Behaviors;

/// <summary>
/// Llama a SaveChangesAsync automaticamente despues de un Command exitoso,
/// para que los Handlers nunca tengan que hacerlo manualmente (Single Responsibility).
/// Las Queries (ICommand no implementado) nunca disparan un SaveChanges.
/// </summary>
public sealed class UnitOfWorkBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : Result
{
    private readonly IUnitOfWork _unitOfWork;

    public UnitOfWorkBehavior(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var response = await next();

        if (response.IsSuccess && IsCommand(request))
            await _unitOfWork.SaveChangesAsync(cancellationToken);

        return response;
    }

    private static bool IsCommand(TRequest request) =>
        request.GetType().GetInterfaces().Any(i =>
            i == typeof(ICommand) ||
            (i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ICommand<>)));
}
