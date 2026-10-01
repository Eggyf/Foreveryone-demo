namespace ForEveryone.Kingdom.Domain;

// Value Object inmutable
public record Resources(int Wood, int Stone, int Gold, int Food)
{
    public static Resources Initial => new(1000, 1000, 500, 200);

    public bool CanAfford(Resources cost) =>
        Wood >= cost.Wood && Stone >= cost.Stone && Gold >= cost.Gold && Food >= cost.Food;

    public Resources Deduct(Resources cost)
    {
        // Red de seguridad: las reglas de negocio ya comprueban el affordability
        // antes de deducir, asi que este fallo significa un forgot de esa
        // comprobacion, no una situacion de juego. El mensaje va al log.
        if (!CanAfford(cost))
            throw new DomainRuleException("kingdom.error.notEnoughResources");

        return new Resources(Wood - cost.Wood, Stone - cost.Stone, Gold - cost.Gold, Food - cost.Food);
    }
}