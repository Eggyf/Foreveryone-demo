using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Heroes.Infrastructure.Persistence;

public class BattleRepository : IBattleRepository
{
    private readonly HeroesDbContext _context;

    public BattleRepository(HeroesDbContext context)
    {
        _context = context;
    }

    public async Task<Battle?> GetActiveByHeroIdAsync(Guid heroId)
    {
        return await _context.Battles
            .FirstOrDefaultAsync(b => b.HeroId == heroId && b.Status == BattleStatus.InProgress);
    }

    public async Task<Battle?> GetByIdAsync(Guid battleId)
    {
        return await _context.Battles.FirstOrDefaultAsync(b => b.Id == battleId);
    }

    public async Task AddAsync(Battle battle)
    {
        await _context.Battles.AddAsync(battle);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Battle battle)
    {
        // EF Core rastrea los cambios automaticamente
        await _context.SaveChangesAsync();
    }
}
