using ForEveryone.Kingdom.Domain;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Kingdom.Infrastructure.Persistence;

public class KingdomDbContext : DbContext
{
    public KingdomDbContext(DbContextOptions<KingdomDbContext> options) : base(options) { }

    public DbSet<Kingdoms> Kingdoms => Set<Kingdoms>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Kingdoms>(builder =>
        {
            builder.HasKey(k => k.Id);
            builder.HasIndex(k => k.UserId).IsUnique();
            builder.Property(k => k.CastleLevel).IsRequired();

            // Mapear Value Object Resources
            builder.OwnsOne(k => k.Resources, rb =>
            {
                rb.Property(r => r.Wood).HasColumnName("Wood");
                rb.Property(r => r.Stone).HasColumnName("Stone");
                rb.Property(r => r.Gold).HasColumnName("Gold");
                rb.Property(r => r.Food).HasColumnName("Food");
            });

            // Mapear la colección de Buildings como Owned Entities (esto ahora funcionará perfecto)
            builder.OwnsMany(k => k.Buildings, bb =>
            {
                bb.ToTable("KingdomBuildings");
                bb.WithOwner().HasForeignKey("KingdomId");
                bb.HasKey(b => b.Id);
                bb.Property(b => b.Type).HasConversion<string>();
            });
        });
    }
}