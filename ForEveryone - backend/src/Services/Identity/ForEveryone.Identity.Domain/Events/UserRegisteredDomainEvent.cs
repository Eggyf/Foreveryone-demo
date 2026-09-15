using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Domain.Events;

/// <summary>
/// Se dispara cuando un nuevo usuario se registra exitosamente.
/// En el futuro, el microservicio Heroes podra escuchar este evento
/// (via un message broker) para crear automaticamente el heroe inicial.
/// </summary>
public sealed record UserRegisteredDomainEvent(Guid UserId, string Email) : IDomainEvent;
