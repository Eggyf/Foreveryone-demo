using ForEveryone.Heroes.Domain;
using System.Threading.Tasks;

namespace Heroes.Application.Interfaces;

public interface IHeroRepository
{
    Task<bool> ExistsByUserIdAsync(Guid userId);
    Task AddAsync(Hero hero);
    Task<Hero?> GetByUserIdAsync(Guid userId); // <-- NUEVO
}