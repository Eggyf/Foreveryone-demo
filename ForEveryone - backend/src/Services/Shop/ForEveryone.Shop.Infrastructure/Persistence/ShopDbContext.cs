using ForEveryone.Shop.Domain;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Shop.Infrastructure.Persistence;

public class ShopDbContext : DbContext
{
    public ShopDbContext(DbContextOptions<ShopDbContext> options) : base(options) { }

    public DbSet<ShopItem> ShopItems => Set<ShopItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShopItem>(builder =>
        {
            builder.HasKey(i => i.Id);
            builder.Property(i => i.Name).IsRequired().HasMaxLength(100);
            builder.Property(i => i.Description).IsRequired();
            builder.Property(i => i.Cost).IsRequired();
            builder.Property(i => i.AttackBoost).IsRequired();
            builder.Property(i => i.DefenseBoost).IsRequired();
            builder.Property(i => i.HealToFull).IsRequired();

            // Seed de datos inicial
            builder.HasData(
                new ShopItem(1, "🗡️ Espada de Hierro", "Aumenta el Ataque +10 permanentemente.", 100, 10, 0, false),
                new ShopItem(2, "🛡️ Armadura de Cuero", "Aumenta la Defensa +10 permanentemente.", 150, 0, 10, false),
                new ShopItem(3, "🧪 Poción de Vida", "Restaura toda tu vida al instante.", 50, 0, 0, true)
            );
        });
    }
}