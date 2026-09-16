using ForEveryone.Kingdom.Domain;

namespace ForEveryone.Kingdom.Domain;

public class Building
{
    public Guid Id { get; private set; }
    public BuildingType Type { get; private set; }
    public int Level { get; private set; }

    // Para EF Core
    private Building() { }

    // Cambio aquí: Sin Guid
    public Building(BuildingType type, int level)
    {
        Type = type;
        Level = level;
    }
}