using ForEveryone.Heroes.Domain;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Heroes.Infrastructure.Persistence;

public class HeroesDbContext : DbContext
{
    public HeroesDbContext(DbContextOptions<HeroesDbContext> options) : base(options) { }

    public DbSet<Hero> Heroes => Set<Hero>();

    public DbSet<Battle> Battles => Set<Battle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Aplica BattleConfiguration junto al resto de configuraciones.
        modelBuilder.Entity<Battle>(builder =>
        {
            builder.ToTable("Battles");
            builder.HasKey(b => b.Id);
            builder.Property(b => b.Id).ValueGeneratedNever();
            builder.Property(b => b.EnemyKey).HasMaxLength(40).IsRequired();
            builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(b => b.ActionsCsv).HasColumnName("Actions").HasMaxLength(64).IsRequired();
            builder.Ignore(b => b.Actions);
            builder.Ignore(b => b.IsFinished);
            builder.HasIndex(b => b.HeroId);
        });

        modelBuilder.Entity<Hero>(builder =>
        {
            builder.HasKey(h => h.Id);
            builder.HasIndex(h => h.UserId).IsUnique(); // Forzamos 1 héroe por usuario en BD
            builder.Property(h => h.Race).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(h => h.Class).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(h => h.CurrentHealth).IsRequired(); // <-- NUEVO
            builder.Property(h => h.Gold).IsRequired();

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