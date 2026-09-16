namespace ForEveryone.Heroes.Domain;

public class Hero
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public HeroClass Class { get; private set; }
    public int Level { get; private set; }
    public int Experience { get; private set; }
    public HeroStats Stats { get; private set; }
    public int CurrentHealth { get; private set; }
    public int Gold { get; private set; } // NUEVO: Oro del héroe

    public bool IsDefeated => CurrentHealth <= 0;

    private Hero() { }

    public Hero(Guid id, Guid userId, HeroClass heroClass, HeroStats stats)
    {
        Id = id;
        UserId = userId;
        Class = heroClass;
        Level = 1;
        Experience = 0;
        Stats = stats;
        CurrentHealth = stats.Health;
        Gold = 0; // Empieza sin oro
    }

    public void GainExperience(int amount)
    {
        if (amount <= 0) throw new ArgumentException("Experience must be greater than zero", nameof(amount));
        Experience += amount;
        while (Experience >= Level * 100)
        {
            Experience -= Level * 100;
            LevelUp();
        }
    }

    private void LevelUp()
    {
        Level++;
        Stats = Stats with
        {
            Health = Stats.Health + 20,
            Attack = Stats.Attack + 5,
            Defense = Stats.Defense + 5,
            Mana = Stats.Mana + 10
        };
        CurrentHealth = Stats.Health;
    }

    public void TakeDamage(int amount)
    {
        if (amount <= 0) return;
        CurrentHealth = Math.Max(0, CurrentHealth - amount);
    }

    public void Rest()
    {
        CurrentHealth = Stats.Health;
    }

    // --- NUEVAS MECÁNICAS DE TIENDA ---
    public void AddGold(int amount)
    {
        if (amount <= 0) return;
        Gold += amount;
    }

    public void ApplyPermanentBoost(int attackBoost, int defenseBoost)
    {
        Stats = Stats with
        {
            Attack = Stats.Attack + attackBoost,
            Defense = Stats.Defense + defenseBoost
        };
    }

    public void PurchaseItem(int cost, int attackBoost, int defenseBoost, bool healToFull)
    {
        if (Gold < cost)
            throw new InvalidOperationException("Oro insuficiente para comprar este objeto.");

        Gold -= cost;

        if (attackBoost > 0 || defenseBoost > 0)
            ApplyPermanentBoost(attackBoost, defenseBoost);

        if (healToFull)
            CurrentHealth = Stats.Health;
    }
}