using ForEveryone.Heroes.Application.Interfaces;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Heroes.Infrastructure.Persistence;

public class HeroRepository : IHeroRepository
{
    private readonly HeroesDbContext _context;

    public HeroRepository(HeroesDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsByUserIdAsync(Guid userId)
    {
        return await _context.Heroes.AnyAsync(h => h.UserId == userId);
    }

    public async Task AddAsync(Hero hero)
    {
        await _context.Heroes.AddAsync(hero);
        await _context.SaveChangesAsync();
    }
    public async Task<Hero?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Heroes.FirstOrDefaultAsync(h => h.UserId == userId);
    }
}