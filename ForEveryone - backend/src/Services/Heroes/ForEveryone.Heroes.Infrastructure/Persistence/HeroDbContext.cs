using ForEveryone.Heroes.Domain;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Heroes.Infrastructure.Persistence;

public class HeroesDbContext : DbContext
{
    public HeroesDbContext(DbContextOptions<HeroesDbContext> options) : base(options) { }

    public DbSet<Hero> Heroes => Set<Hero>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Hero>(builder =>
        {
            builder.HasKey(h => h.Id);
            builder.HasIndex(h => h.UserId).IsUnique(); // Forzamos 1 héroe por usuario en BD
            builder.Property(h => h.Class).HasConversion<string>();

            // Mapeo del Value Object
            builder.OwnsOne(h => h.Stats, sb =>
            {
                sb.Property(s => s.Health).HasColumnName("Health");
                sb.Property(s => s.Attack).HasColumnName("Attack");
                sb.Property(s => s.Defense).HasColumnName("Defense");
                sb.Property(s => s.Mana).HasColumnName("Mana");
            });
        });
    }
}