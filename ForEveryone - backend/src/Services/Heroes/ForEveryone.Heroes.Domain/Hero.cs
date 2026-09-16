namespace ForEveryone.Heroes.Domain;

public class Hero
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public HeroClass Class { get; private set; }
    public int Level { get; private set; }
    public int Experience { get; private set; }
    public HeroStats Stats { get; private set; }

    // NUEVO: Vida actual del héroe (cambia durante el combate)
    public int CurrentHealth { get; private set; }
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
        CurrentHealth = stats.Health; // Empieza con vida máxima
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
        // Al subir de nivel, el héroe se cura completamente
        CurrentHealth = Stats.Health;
    }

    // NUEVO: Recibir daño en combate
    public void TakeDamage(int amount)
    {
        if (amount <= 0) return;
        CurrentHealth = Math.Max(0, CurrentHealth - amount);
    }

    // NUEVO: Descansar para recuperar vida
    public void Rest()
    {
        CurrentHealth = Stats.Health;
    }
}