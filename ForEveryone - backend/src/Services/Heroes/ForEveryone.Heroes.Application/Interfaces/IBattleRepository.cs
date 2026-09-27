using ForEveryone.Heroes.Domain;

namespace Heroes.Application.Interfaces;

public interface IBattleRepository
{
    /// <summary>Combate sin terminar de un heroe, si existe.</summary>
    Task<Battle?> GetActiveByHeroIdAsync(Guid heroId);

    Task<Battle?> GetByIdAsync(Guid battleId);

    Task AddAsync(Battle battle);

    Task UpdateAsync(Battle battle);
}
