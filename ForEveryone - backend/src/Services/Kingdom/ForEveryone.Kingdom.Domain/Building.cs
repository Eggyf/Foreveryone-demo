namespace ForEveryone.Kingdom.Domain;

public class Building
{
    public Guid Id { get; private set; }
    public BuildingType Type { get; private set; }
    public int Level { get; private set; }

    // Para EF Core
    private Building() { }

    public Building(Guid id, BuildingType type, int level)
    {
        Id = id;
        Type = type;
        Level = level;
    }
}