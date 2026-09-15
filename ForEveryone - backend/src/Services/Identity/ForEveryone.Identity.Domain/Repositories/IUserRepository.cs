using ForEveryone.Identity.Domain.Entities;
using ForEveryone.Identity.Domain.ValueObjects;

namespace ForEveryone.Identity.Domain.Repositories;

/// <summary>
/// Puerto definido por el dominio. La implementacion concreta (EF Core + Npgsql)
/// vive en Infrastructure, que depende de esta interfaz y no al reves (DIP).
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(Email email, CancellationToken cancellationToken = default);

    void Add(User user);
}
