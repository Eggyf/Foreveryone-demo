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
}