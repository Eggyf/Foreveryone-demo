namespace ForEveryone.Kingdom.Domain;

// Value Object inmutable
public record Resources(int Wood, int Stone, int Gold, int Food)
{
    public static Resources Initial => new(1000, 1000, 500, 200);

    public bool CanAfford(Resources cost) =>
        Wood >= cost.Wood && Stone >= cost.Stone && Gold >= cost.Gold && Food >= cost.Food;

    public Resources Deduct(Resources cost)
    {
        if (!CanAfford(cost))
            throw new InvalidOperationException("Recursos insuficientes.");

        return new Resources(Wood - cost.Wood, Stone - cost.Stone, Gold - cost.Gold, Food - cost.Food);
    }
}