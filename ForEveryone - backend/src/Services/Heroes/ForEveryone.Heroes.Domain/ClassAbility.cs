using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Que hace una habilidad ademas de inflictir dano. Es lo que permite que la
/// tercera accion de cada clase tenga un comportamiento propio en lugar de ser
/// "otro ataque mas fuerte".
/// </summary>
public enum AbilityEffect
{
    /// <summary>Dano normal, descontando la defensa del enemigo.</summary>
    Damage = 0,

    /// <summary>Dano que ignora por completo la defensa del enemigo.</summary>
    Pierce = 1,

    /// <summary>No hace dano: reduce a la mitad el daño recibido este turno.</summary>
    Guard = 2,

    /// <summary>No hace dano contra el enemigo: recupera vida antes del contraataque.</summary>
    Heal = 3,

    /// <summary>Dano normal que ademas devuelve al heroe parte de la vida que quita.</summary>
    Drain = 4
}

/// <summary>
/// Definicion de una accion de combate. Los identificadores son
/// <see cref="BattleAction"/> (ranuras), no nombres propios de clase: el mismo
/// identificador significa "la habilidad caracteristica de mi clase", y
/// la clave de traduccion la decide el catalogo.
/// </summary>
/// <param name="Action">Ranura que ocupa esta habilidad.</param>
/// <param name="Effect">Comportamiento adicional al dano.</param>
/// <param name="NameKey">Clave del nombre visible, traducida por el cliente.</param>
/// <param name="DescriptionKey">Clave de la explicacion de una linea para el boton.</param>
/// <param name="DamagePercent">Dano como porcentaje del ataque: 100 es x1, 200 es x2.</param>
/// <param name="ManaCostPercent">Coste como porcentaje del maná maximo.</param>
/// <param name="UseLimit">Usos por combate; 0 significa sin limite.</param>
/// <param name="HealPercent">Vida recuperada como porcentaje de la maxima, para Heal y Drain.</param>
public sealed record ClassAbility(
    BattleAction Action,
    AbilityEffect Effect,
    string NameKey,
    string DescriptionKey,
    int DamagePercent,
    int ManaCostPercent,
    int UseLimit,
    int HealPercent = 0);

/// <summary>
/// Catalogo de kits de combate por clase. Es la unica fuente de la tabla de
/// balance de habilidades, igual que <see cref="ClassBonus"/> lo es de las
/// estadisticas base.
///
/// Cada clase tiene exactamente tres ranuras:
///  1. ataque basico, gratis e ilimitado, para que nunca haya bloqueo;
///  2. habilidad caracteristica con limite de usos;
///  3. exclusiva de la clase, con un efecto propio.
///
/// El maná se expresa como porcentaje del maximo porque las clases tienen
/// reservas muy distintas (Guerrero 10, Mago 50): un coste absoluto haria que
/// el Guerrero no pudiera usar nunca su habilidad y el Mago la usara sin
/// pensarlo.
///
/// El catalogo no redacta ningun texto: guarda claves de traduccion. La frase
/// que ve el jugador la compone el cliente, para que el mismo kit se lea igual
/// en los dos idiomas.
/// </summary>
public static class ClassAbilities
{
    /// <summary>
    /// Porcentaje de maná maximo que el heroe recupera al empezar cada uno de
    /// sus turnos, antes de pagar el coste de la accion. Como el ataque basico
    /// no cuesta maná, el recurso nunca se queda atascado a cero.
    /// </summary>
    public const int ManaRegenPercent = 20;

    /// <summary>
    /// Redondeo de los porcentajes a un valor entero de maná. Se centraliza
    /// para que el motor, el mensaje y la disponibilidad usen el mismo número.
    /// </summary>
    public static int ManaCost(HeroStats stats, ClassAbility ability) =>
        ability.ManaCostPercent <= 0
            ? 0
            : Math.Max(1, stats.Mana * ability.ManaCostPercent / 100);

    public static int ManaRegen(HeroStats stats) => Math.Max(1, stats.Mana * ManaRegenPercent / 100);

    /// <summary>Las tres acciones del kit, en el orden en que se pintan.</summary>
    public static IReadOnlyList<ClassAbility> For(HeroClass heroClass) => heroClass switch
    {
        // El Guerrero no es magico: sus dos opciones gastan cero maná. Juega de
        // fuerza bruta y de paciencia.
        HeroClass.Warrior =>
        [
            new(BattleAction.Attack, AbilityEffect.Damage,
                "ability.warrior.attack.name", "ability.warrior.attack.desc", 100, 0, 0),
            new(BattleAction.PowerStrike, AbilityEffect.Damage,
                "ability.warrior.powerStrike.name", "ability.warrior.powerStrike.desc", 200, 0, 2),
            new(BattleAction.Special, AbilityEffect.Guard,
                "ability.warrior.special.name", "ability.warrior.special.desc", 0, 0, 2)
        ],

        // El Cazador depende de la puntería, no de la magia: Andanada es barata
        // y se repite, y su exclusiva atraviesa la armadura del enemigo.
        HeroClass.Hunter =>
        [
            new(BattleAction.Attack, AbilityEffect.Damage,
                "ability.hunter.attack.name", "ability.hunter.attack.desc", 100, 0, 0),
            new(BattleAction.PowerStrike, AbilityEffect.Damage,
                "ability.hunter.powerStrike.name", "ability.hunter.powerStrike.desc", 180, 25, 2),
            new(BattleAction.Special, AbilityEffect.Pierce,
                "ability.hunter.special.name", "ability.hunter.special.desc", 220, 50, 1)
        ],

        // El Mago es cristal: poca vida y poca defensa, a cambio del mayor daño
        // del juego y de una curtura cara.
        HeroClass.Wizard =>
        [
            new(BattleAction.Attack, AbilityEffect.Damage,
                "ability.wizard.attack.name", "ability.wizard.attack.desc", 90, 0, 0),
            new(BattleAction.PowerStrike, AbilityEffect.Damage,
                "ability.wizard.powerStrike.name", "ability.wizard.powerStrike.desc", 240, 40, 2),
            new(BattleAction.Special, AbilityEffect.Heal,
                "ability.wizard.special.name", "ability.wizard.special.desc", 0, 60, 1, 30)
        ],

        // El Pícaro Sangre Fría le devuelve al atacante parte de lo que quita,
        // lo que le permite alargar combates largos.
        HeroClass.Rogue =>
        [
            new(BattleAction.Attack, AbilityEffect.Damage,
                "ability.rogue.attack.name", "ability.rogue.attack.desc", 100, 0, 0),
            new(BattleAction.PowerStrike, AbilityEffect.Damage,
                "ability.rogue.powerStrike.name", "ability.rogue.powerStrike.desc", 230, 20, 2),
            new(BattleAction.Special, AbilityEffect.Drain,
                "ability.rogue.special.name", "ability.rogue.special.desc", 240, 35, 2, 50)
        ],
        _ => throw new ArgumentOutOfRangeException(
            nameof(heroClass), heroClass, "Clase desconocida.")
    };

    /// <summary>
    /// Habilidad de una ranura concreta del kit. Si la accion no pertenece a la
    /// clase devuelve <c>null</c>: es lo que permite rechazar en el servidor
    /// que un jugador use la habilidad de otra clase.
    /// </summary>
    public static ClassAbility? Find(HeroClass heroClass, BattleAction action) =>
        For(heroClass).FirstOrDefault(ability => ability.Action == action);
}