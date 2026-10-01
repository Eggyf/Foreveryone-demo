namespace ForEveryone.Shop.Domain;

/// <summary>
/// Articulo del catalogo de la tienda.
///
/// <see cref="Key"/> es el identificador estable con el que el cliente busca la
/// traduccion del nombre y la descripcion. <see cref="Name"/> y
/// <see cref="Description"/> se conservan como el texto base en castellano que
/// se siembró en la base de datos: no son la fuente de verdad para el jugador,
/// la clave lo es.
/// </summary>
public class ShopItem
{
    public int Id { get; private set; }
    public string Key { get; private set; } = string.Empty;
    public string Name { get; private set; }
    public string Description { get; private set; }
    public int Cost { get; private set; }
    public int AttackBoost { get; private set; }
    public int DefenseBoost { get; private set; }
    public bool HealToFull { get; private set; }

    private ShopItem() { }

    public ShopItem(int id, string key, string name, string description, int cost, int attackBoost, int defenseBoost, bool healToFull)
    {
        Id = id;
        Key = key;
        Name = name;
        Description = description;
        Cost = cost;
        AttackBoost = attackBoost;
        DefenseBoost = defenseBoost;
        HealToFull = healToFull;
    }
}