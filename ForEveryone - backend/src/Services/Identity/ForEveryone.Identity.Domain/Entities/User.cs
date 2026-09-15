using ForEveryone.Identity.Domain.Enums;
using ForEveryone.Identity.Domain.Events;
using ForEveryone.Identity.Domain.ValueObjects;
using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Domain.Entities;

/// <summary>
/// Aggregate Root del contexto Identity. Es el unico punto de entrada
/// para crear o modificar un usuario: no existen setters publicos.
/// </summary>
public sealed class User : AggregateRoot
{
    // Constructor privado sin parametros requerido por EF Core.
    private User() { }

    private User(Guid id, Email email, string passwordHash, Role role, DateTime createdAtUtc)
        : base(id)
    {
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        CreatedAtUtc = createdAtUtc;
        IsActive = true;
    }

    public Email Email { get; private set; } = null!;

    public string PasswordHash { get; private set; } = null!;

    public Role Role { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    public bool IsActive { get; private set; }

    /// <summary>
    /// Unica forma de crear un usuario valido. La unicidad del email
    /// se valida en la capa de Application (requiere consultar el repositorio).
    /// </summary>
    public static Result<User> Register(Email email, string passwordHash)
    {
        Guard.AgainstNullOrWhiteSpace(passwordHash, nameof(passwordHash));

        var user = new User(
            Guid.NewGuid(),
            email,
            passwordHash,
            Role.Player,
            DateTime.UtcNow);

        user.RaiseDomainEvent(new UserRegisteredDomainEvent(user.Id, email.Value));

        return Result.Success(user);
    }

    public void Deactivate() => IsActive = false;
}
