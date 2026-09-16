namespace ForEveryone.Shop.Domain;

public class ShopItem
{
    public int Id { get; private set; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public int Cost { get; private set; }
    public int AttackBoost { get; private set; }
    public int DefenseBoost { get; private set; }
    public bool HealToFull { get; private set; }

    private ShopItem() { }

    public ShopItem(int id, string name, string description, int cost, int attackBoost, int defenseBoost, bool healToFull)
    {
        Id = id;
        Name = name;
        Description = description;
        Cost = cost;
        AttackBoost = attackBoost;
        DefenseBoost = defenseBoost;
        HealToFull = healToFull;
    }
}