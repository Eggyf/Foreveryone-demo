using System.Reflection;
using ForEveryone.Identity.Domain.Entities;
using ForEveryone.SharedKernel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Identity.Infrastructure.Persistence;

public sealed class IdentityDbContext : DbContext
{
    private readonly IPublisher _publisher;

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options, IPublisher publisher)
        : base(options)
    {
        _publisher = publisher;
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        modelBuilder.HasDefaultSchema("identity");
    }

    /// <summary>
    /// Sobrescribimos SaveChangesAsync para despachar los Domain Events acumulados
    /// en los aggregates DESPUES de persistir exitosamente los cambios.
    /// Por ahora el despacho es in-process (MediatR); cuando existan mas microservicios
    /// escuchando estos eventos, aqui se reemplaza por publicacion a un message broker.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);

        await DispatchDomainEventsAsync(cancellationToken);

        return result;
    }

    private async Task DispatchDomainEventsAsync(CancellationToken cancellationToken)
    {
        var entitiesWithEvents = ChangeTracker.Entries<Entity>()
            .Select(entry => entry.Entity)
            .Where(entity => entity.DomainEvents.Count > 0)
            .ToList();

        var domainEvents = entitiesWithEvents
            .SelectMany(entity => entity.DomainEvents)
            .ToList();

        entitiesWithEvents.ForEach(entity => entity.ClearDomainEvents());

        foreach (var domainEvent in domainEvents)
        {
            await _publisher.Publish(domainEvent, cancellationToken);
        }
    }
}
