namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Resuelve el combate por turnos entre un heroe y un enemigo.
/// Es logica de dominio pura: no toca la base de datos ni conoce la capa de
/// aplicacion, por lo que se puede razonar y probar de forma aislada.
/// La batalla es determinista: sin azar, el resultado depende solo de las
/// estadisticas y de las acciones elegidas.
/// </summary>
public static class BattleEngine
{
    /// <summary>
    /// Cuantas veces puede usarse la habilidad fuerte dentro de un mismo combate.
    /// Es lo que convierte la eleccion en una decision real: gastarla pronto
    /// o guardarla para cuando el enemigo quede weakened.
    /// </summary>
    public const int SkillUsesPerBattle = 2;

    /// <summary>Multiplicador de dano de la habilidad fuerte frente al ataque basico.</summary>
    private const int PowerStrikeMultiplier = 2;

    /// <summary>
    /// Dano que inflige una accion. Nunca baja de 1 punto, de modo que un
    /// enemigo con mucha defensa no pueda hacer que el combate se eternice.
    /// </summary>
    public static int DamageFor(BattleAction action, HeroStats stats, Enemy enemy)
    {
        var attack = action switch
        {
            BattleAction.Attack => stats.Attack,
            BattleAction.PowerStrike => stats.Attack * PowerStrikeMultiplier,
            _ => throw new ArgumentOutOfRangeException(nameof(action), action, "Accion desconocida.")
        };

        return Math.Max(1, attack - enemy.Defense);
    }

    public static int SkillUses(IReadOnlyList<BattleAction> actions) =>
        actions.Count(action => action == BattleAction.PowerStrike);

    public static int SkillUsesLeft(IReadOnlyList<BattleAction> actions) =>
        Math.Max(0, SkillUsesPerBattle - SkillUses(actions));

    /// <summary>
    /// Indica si el jugador puede elegir esa accion ahora mismo.
    /// </summary>
    public static bool IsAvailable(BattleAction action, IReadOnlyList<BattleAction> actions) =>
        action switch
        {
            BattleAction.Attack => true,
            BattleAction.PowerStrike => SkillUsesLeft(actions) > 0,
            _ => false
        };

    /// <summary>
    /// Reproduce el combate completo a partir de las acciones jugadas y
    /// devuelve el estado resultante. Es una funcion pura: mismas entradas,
    /// mismo resultado. Por eso basta con guardar la secuencia de acciones
    /// para poder reconstruir la pelea entera.
    /// </summary>
    public static BattleReplay Replay(
        HeroStats stats,
        int heroHealthAtStart,
        Enemy enemy,
        IReadOnlyList<BattleAction> actions)
    {
        var heroHealth = heroHealthAtStart;
        var enemyHealth = enemy.Health;
        var rounds = new List<CombatRound>();

        for (var index = 0; index < actions.Count; index++)
        {
            if (enemyHealth <= 0 || heroHealth <= 0) break;

            var round = index + 1;
            var heroDamage = DamageFor(actions[index], stats, enemy);
            enemyHealth = Math.Max(0, enemyHealth - heroDamage);

            // Si el enemigo muere con ese golpe, no llega a contraatacar.
            if (enemyHealth <= 0)
            {
                rounds.Add(new CombatRound(
                    round, actions[index], heroDamage, 0, enemyHealth, heroHealth,
                    $"Turno {round}: {Label(actions[index])} y hace {heroDamage} de daño. ¡{enemy.Name} ha caído!"));

                break;
            }

            var enemyDamage = Math.Max(1, enemy.Attack - stats.Defense);
            heroHealth = Math.Max(0, heroHealth - enemyDamage);

            rounds.Add(new CombatRound(
                round, actions[index], heroDamage, enemyDamage, enemyHealth, heroHealth,
                $"Turno {round}: {Label(actions[index])} y hace {heroDamage} de daño. " +
                $"{enemy.Name} responde con {enemyDamage}. Tu vida: {heroHealth}."));
        }

        var victory = enemyHealth <= 0;

        return new BattleReplay(
            Victory: victory,
            Finished: victory || heroHealth <= 0,
            EnemyHealth: enemyHealth,
            HeroHealth: heroHealth,
            Rounds: rounds,
            ExperienceGained: victory ? enemy.ExperienceReward : 0,
            GoldGained: victory ? enemy.GoldReward : 0);
    }

    private static string Label(BattleAction action) => action switch
    {
        BattleAction.Attack => "Ataque normal",
        BattleAction.PowerStrike => "Golpe poderoso",
        _ => "Acción desconocida"
    };
}
