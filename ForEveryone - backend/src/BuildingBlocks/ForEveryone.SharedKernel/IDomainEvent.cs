using MediatR;

namespace ForEveryone.SharedKernel;

/// <summary>
/// Todo Domain Event implementa INotification para poder ser despachado
/// in-process via MediatR (dentro del mismo microservicio).
/// </summary>
public interface IDomainEvent : INotification
{
    Guid EventId => Guid.NewGuid();

    DateTime OccurredOnUtc => DateTime.UtcNow;
}
