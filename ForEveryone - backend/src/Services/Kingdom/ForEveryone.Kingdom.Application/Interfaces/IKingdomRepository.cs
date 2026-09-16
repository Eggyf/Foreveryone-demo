using ForEveryone.Kingdom.Domain;

namespace ForEveryone.Kingdom.Application.Interfaces;

public interface IKingdomRepository
{
    Task<bool> ExistsByUserIdAsync(Guid userId);
    Task AddAsync(Kingdoms kingdom);
    Task<Kingdoms?> GetByUserIdAsync(Guid userId); // <-- NUEVO
}