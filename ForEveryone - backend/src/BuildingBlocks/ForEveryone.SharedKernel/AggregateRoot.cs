namespace ForEveryone.SharedKernel;

/// <summary>
/// Marca una Entity como raiz de un Aggregate (limite de consistencia transaccional).
/// Solo los Aggregate Roots deben tener repositorios propios.
/// </summary>
public abstract class AggregateRoot : Entity
{
    protected AggregateRoot(Guid id) : base(id) { }

    protected AggregateRoot() { }
}
