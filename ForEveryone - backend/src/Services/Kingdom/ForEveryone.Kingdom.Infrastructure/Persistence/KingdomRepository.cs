using ForEveryone.Kingdom.Application.Interfaces;
using ForEveryone.Kingdom.Domain;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Kingdom.Infrastructure.Persistence;

public class KingdomRepository : IKingdomRepository
{
    private readonly KingdomDbContext _context;

    public KingdomRepository(KingdomDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsByUserIdAsync(Guid userId)
    {
        return await _context.Kingdoms.AnyAsync(k => k.UserId == userId);
    }

    public async Task AddAsync(Kingdoms kingdom)
    {
        await _context.Kingdoms.AddAsync(kingdom);
        await _context.SaveChangesAsync();
    }
}