using ForEveryone.Kingdom.Domain;

public class Kingdoms
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public int CastleLevel { get; private set; }
    public Resources Resources { get; private set; }
    public DateTime LastCollectedTime { get; private set; }
    public int ArmySize { get; private set; } // NUEVO: Tamaño del ejército

    public List<Building> Buildings { get; private set; } = new();

    private Kingdoms()
    {
        Resources = default!;
        LastCollectedTime = default!;
    }

    public Kingdoms(Guid id, Guid userId)
    {
        Id = id;
        UserId = userId;
        CastleLevel = 1;
        Resources = Resources.Initial;
        LastCollectedTime = DateTime.UtcNow;
        ArmySize = 0;
        Buildings.Add(new Building(BuildingType.Castle, 1));
    }

    // --- MÉTODO NUEVO: ENTRENAR TROPAS ---
    public void TrainSoldiers(int amount)
    {
        if (amount <= 0)
            throw new ArgumentException("La cantidad a entrenar debe ser mayor a 0.");

        var barracks = Buildings.FirstOrDefault(b => b.Type == BuildingType.Barracks);
        if (barracks is null)
            throw new InvalidOperationException("Necesitas construir un Cuartel (Barracks) primero.");

        // Costo por soldado: 50 Oro, 25 Comida
        int goldCost = amount * 50;
        int foodCost = amount * 25;
        var cost = new Resources(0, 0, goldCost, foodCost);

        if (!Resources.CanAfford(cost))
            throw new InvalidOperationException("Oro o Comida insuficientes para entrenar tropas.");

        Resources = Resources.Deduct(cost);
        ArmySize += amount;
    }

    // Lógica de Poder Militar
    public int GetMilitaryPower()
    {
        // Poder = Soldados + (Nivel de Castillo * 10)
        return ArmySize + (CastleLevel * 10);
    }

    // --- MÉTODOS EXISTENTES (CollectResources, UpgradeBuilding, AddBuilding) ---
    // ... (Mantén los métodos que ya tenías exactamente igual aquí abajo)
    public void CollectResources(DateTime currentTime)
    {
        var timeDiff = currentTime - LastCollectedTime;
        int minutesElapsed = (int)timeDiff.TotalMinutes;

        if (minutesElapsed <= 0) return;

        int effectiveMinutes = Math.Min(minutesElapsed, 120);
        int woodProd = 0, stoneProd = 0, goldProd = 0, foodProd = 0;

        foreach (var building in Buildings)
        {
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

    public void UpgradeBuilding(BuildingType type)
    {
        var building = Buildings.FirstOrDefault(b => b.Type == type);
        if (building is null)
            throw new InvalidOperationException("No tienes ese edificio construido.");

        var cost = GetUpgradeCost(building.Level);
        if (!Resources.CanAfford(cost))
            throw new InvalidOperationException("Recursos insuficientes para mejorar el edificio.");

        Resources = Resources.Deduct(cost);
        building.Upgrade();
    }

    private Resources GetUpgradeCost(int currentLevel)
    {
        int multiplier = currentLevel * 200;
        return new Resources(multiplier, multiplier / 2, 0, 0);
    }

    public void AddBuilding(BuildingType type)
    {
        if (Buildings.Any(b => b.Type == type))
            throw new InvalidOperationException("Ya existe un edificio de este tipo en el reino.");

        var cost = GetBuildingCost(type);
        if (!Resources.CanAfford(cost))
            throw new InvalidOperationException("Recursos insuficientes para construir.");

        Resources = Resources.Deduct(cost);
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