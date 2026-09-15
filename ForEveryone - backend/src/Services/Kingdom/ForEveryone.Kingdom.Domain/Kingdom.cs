namespace ForEveryone.Kingdom.Domain;

public class Kingdoms
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public int CastleLevel { get; private set; }
    public Resources Resources { get; private set; }

    // Cambio aquí: Usamos una List con setter privado para que EF Core la mapee sin problemas
    public List<Building> Buildings { get; private set; } = new();

    private Kingdoms()
    {
        Resources = default!;
    }

    public Kingdoms(Guid id, Guid userId)
    {
        Id = id;
        UserId = userId;
        CastleLevel = 1;
        Resources = Resources.Initial;
        Buildings.Add(new Building(Guid.NewGuid(), BuildingType.Castle, 1));
    }

    public void AddBuilding(BuildingType type)
    {
        if (Buildings.Any(b => b.Type == type))
            throw new InvalidOperationException("Ya existe un edificio de este tipo en el reino.");

        var cost = GetBuildingCost(type);
        if (!Resources.CanAfford(cost))
            throw new InvalidOperationException("Recursos insuficientes para construir.");

        Resources = Resources.Deduct(cost);
        Buildings.Add(new Building(Guid.NewGuid(), type, 1));
    }

    private Resources GetBuildingCost(BuildingType type)
    {
        return type switch
        {
            BuildingType.Farm => new Resources(200, 100, 50, 0),
            BuildingType.Sawmill => new Resources(100, 200, 50, 0),
            BuildingType.Quarry => new Resources(200, 100, 50, 0),
            BuildingType.Market => new Resources(100, 100, 200, 0),
            BuildingType.Barracks => new Resources(300, 300, 100, 50),
            _ => throw new ArgumentOutOfRangeException(nameof(type))
        };
    }
}