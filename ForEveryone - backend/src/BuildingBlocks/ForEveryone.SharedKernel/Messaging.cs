using MediatR;

namespace ForEveryone.SharedKernel;

/// <summary>
/// Marca un mensaje como Command (escritura) sin valor de retorno ademas del resultado.
/// Se usa para que el UnitOfWorkBehavior sepa cuando debe hacer SaveChanges
/// (solo para Commands, nunca para Queries).
/// </summary>
public interface ICommand : IRequest<Result>
{
}

/// <summary>
/// Marca un mensaje como Command (escritura) que devuelve un valor en caso de exito.
/// </summary>
public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}

/// <summary>
/// Marca un mensaje como Query (lectura). Nunca dispara SaveChanges.
/// </summary>
public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
