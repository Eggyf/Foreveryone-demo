namespace ForEveryone.Heroes.Domain;

public class Hero
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public HeroClass Class { get; private set; }
    public int Level { get; private set; }
    public int Experience { get; private set; }
    public HeroStats Stats { get; private set; }

    private Hero() { } // Para EF Core

    public Hero(Guid id, Guid userId, HeroClass heroClass, HeroStats stats)
    {
        if (id == Guid.Empty) throw new ArgumentException("Invalid Hero ID");
        if (userId == Guid.Empty) throw new ArgumentException("Invalid User ID");

        Id = id;
        UserId = userId;
        Class = heroClass;
        Level = 1;
        Experience = 0;
        Stats = stats;
    }

    public void GainExperience(int amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Experience must be greater than zero", nameof(amount));

        Experience += amount;

        // Regla de negocio: Se necesita (Nivel * 100) de experiencia para subir de nivel
        while (Experience >= Level * 100)
        {
            Experience -= Level * 100;
            LevelUp();
        }
    }

    private void LevelUp()
    {
        Level++;

        // Al subir de nivel, las stats aumentan (usamos la expresión 'with' para crear un nuevo Value Object)
        Stats = Stats with
        {
            Health = Stats.Health + 20,
            Attack = Stats.Attack + 5,
            Defense = Stats.Defense + 5,
            Mana = Stats.Mana + 10
        };
    }
}