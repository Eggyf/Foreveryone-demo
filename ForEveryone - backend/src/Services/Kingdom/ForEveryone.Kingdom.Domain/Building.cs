namespace ForEveryone.Kingdom.Domain;

public class Building
{
    public Guid Id { get; private set; }
    public BuildingType Type { get; private set; }
    public int Level { get; private set; }

    private Building() { }

    public Building(BuildingType type, int level)
    {
        Type = type;
        Level = level;
    }

    // NUEVO: Método para subir de nivel
    public void Upgrade()
    {
        Level++;
    }
}