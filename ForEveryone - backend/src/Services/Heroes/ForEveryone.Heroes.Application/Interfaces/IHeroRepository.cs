using ForEveryone.Heroes.Domain;

namespace ForEveryone.Heroes.Application.Interfaces;

public interface IHeroRepository
{
    Task<bool> ExistsByUserIdAsync(Guid userId);
    Task AddAsync(Hero hero);
}