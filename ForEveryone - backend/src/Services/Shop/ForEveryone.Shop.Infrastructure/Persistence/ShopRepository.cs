using ForEveryone.Shop.Application.Interfaces;
using ForEveryone.Shop.Domain;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Shop.Infrastructure.Persistence;

public class ShopRepository : IShopRepository
{
    private readonly ShopDbContext _context;

    public ShopRepository(ShopDbContext context)
    {
        _context = context;
    }

    public async Task<List<ShopItem>> GetAllAsync()
    {
        return await _context.ShopItems.ToListAsync();
    }

    public async Task<ShopItem?> GetByIdAsync(int id)
    {
        return await _context.ShopItems.FindAsync(id);
    }
}