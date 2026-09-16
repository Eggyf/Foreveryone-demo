namespace ForEveryone.Kingdom.Domain;

public class Kingdoms
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public int CastleLevel { get; private set; }
    public Resources Resources { get; private set; }
    public DateTime LastCollectedTime { get; private set; }

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
        LastCollectedTime = DateTime.UtcNow;
        Buildings.Add(new Building(BuildingType.Castle, 1));
    }

    // Lógica de recolección pasiva
    public void CollectResources(DateTime currentTime)
    {
        var timeDiff = currentTime - LastCollectedTime;
        int minutesElapsed = (int)timeDiff.TotalMinutes;

        if (minutesElapsed <= 0) return;

        // LÍMITE DE TIEMPO: Máximo 120 minutos (2 horas) de acumulación pasiva
        int effectiveMinutes = Math.Min(minutesElapsed, 120);

        int woodProd = 0, stoneProd = 0, goldProd = 0, foodProd = 0;

        foreach (var building in Buildings)
        {
            // PRODUCCIÓN BAJADA: 5 por nivel en lugar de 10
            switch (building.Type)
            {
                case BuildingType.Sawmill: woodProd += building.Level * 5; break;
                case BuildingType.Quarry: stoneProd += building.Level * 5; break;
                case BuildingType.Market: goldProd += building.Level * 5; break;
                case BuildingType.Farm: foodProd += building.Level * 5; break;
            }
        }

        Resources = new Resources(
            Resources.Wood + (woodProd * effectiveMinutes),
            Resources.Stone + (stoneProd * effectiveMinutes),
            Resources.Gold + (goldProd * effectiveMinutes),
            Resources.Food + (foodProd * effectiveMinutes)
        );

        LastCollectedTime = currentTime;
    }

    public void AddBuilding(BuildingType type)
    {
        if (Buildings.Any(b => b.Type == type))
            throw new InvalidOperationException("Ya existe un edificio de este tipo en el reino.");

        var cost = GetBuildingCost(type);
        if (!Resources.CanAfford(cost))
            throw new InvalidOperationException("Recursos insuficientes para construir.");

        Resources = Resources.Deduct(cost);

        // Cambio aquí: Sin Guid.NewGuid()
        Buildings.Add(new Building(type, 1));
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