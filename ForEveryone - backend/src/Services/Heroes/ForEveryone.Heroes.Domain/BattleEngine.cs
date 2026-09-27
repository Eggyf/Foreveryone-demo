namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Resuelve el combate por turnos entre un heroe y un enemigo.
/// Es logica de dominio pura: no toca la base de datos ni conoce la capa de
/// aplicacion, por lo que se puede razonar y probar de forma aislada.
/// La batalla es determinista: sin azar, el resultado depende solo de las
/// estadisticas, la clase y las acciones elegidas.
///
/// La clase entra porque cada una tiene su propio kit de tres habilidades y
/// porque el maná maximo determina cuanto cuesta cada una. El maná se regenera
/// por turno en lugar de acumularse, asi que se deduce de la secuencia de
/// acciones y no hace falta guardarlo turno a turno.
/// </summary>
public static class BattleEngine
{
    /// <summary>Porcentaje de daño que la Guardia deja pasar.</summary>
    private const int GuardMultiplierPercent = 50;

    /// <summary>
    /// Percentage del daño infligido que el Robo de vida devuelve al heroe.
    /// </summary>
    private const int DrainHealPercent = 50;

    /// <summary>
    /// Dano que inflige una habilidad. Nunca baja de 1 punto, de modo que un
    /// enemigo con mucha defensa no pueda hacer que el combate se eternice.
    /// <see cref="AbilityEffect.Pierce"/> ignora la defensa, que es justo lo que
    /// lo hace especial frente a los enemigos blindados.
    /// </summary>
    public static int DamageFor(ClassAbility ability, HeroStats stats, Enemy enemy)
    {
        if (ability.Effect is AbilityEffect.Guard or AbilityEffect.Heal) return 0;

        var raw = stats.Attack * ability.DamagePercent / 100;

        return ability.Effect == AbilityEffect.Pierce
            ? Math.Max(1, raw)
            : Math.Max(1, raw - enemy.Defense);
    }

    /// <summary>Cuantos usos lleva gastados de una ranura concreta.</summary>
    public static int UsesSpent(BattleAction action, IReadOnlyList<BattleAction> played) =>
        played.Count(played => played == action);

    /// <summary>Usos que le quedan de una habilidad, respetando su limite.</summary>
    public static int UsesLeft(ClassAbility ability, IReadOnlyList<BattleAction> played) =>
        ability.UseLimit <= 0
            ? int.MaxValue
            : Math.Max(0, ability.UseLimit - UsesSpent(ability.Action, played));

    /// <summary>
    /// Por que una accion no se puede jugar ahora mismo, o <c>null</c> si si se
    /// puede. Se devuelve el motivo en vez de un booleano porque el cliente lo
    /// muestra tal cual y evita tener que adivinarlo en el frontend.
    /// </summary>
    public static string? Unavailability(
        BattleAction action,
        HeroClass heroClass,
        HeroStats stats,
        int heroMana,
        IReadOnlyList<BattleAction> played)
    {
        var ability = ClassAbilities.Find(heroClass, action);

        // Una ranura que no es del kit de la clase no es un conflicto de estado
        // sino una peticion invalida: el jugador intenta usar magia sin ser mago.
        if (ability is null)
            return "Tu clase no tiene esa habilidad.";

        if (ability.UseLimit > 0 && UsesLeft(ability, played) <= 0)
            return $"No te quedan usos de {ability.Name}.";

        var cost = ClassAbilities.ManaCost(stats, ability);

        if (cost > heroMana)
            return $"Necesitas {cost} de maná para {ability.Name} y solo tienes {heroMana}.";

        return null;
    }

    public static bool CanPlay(
        BattleAction action,
        HeroClass heroClass,
        HeroStats stats,
        int heroMana,
        IReadOnlyList<BattleAction> played) =>
        Unavailability(action, heroClass, stats, heroMana, played) is null;

    /// <summary>
    /// Reproduce el combate completo a partir de las acciones jugadas y
    /// devuelve el estado resultante. Es una funcion pura: mismas entradas,
    /// mismo resultado. Por eso basta con guardar la secuencia de acciones
    /// para poder reconstruir la pelea entera.
    /// </summary>
    public static BattleReplay Replay(
        HeroClass heroClass,
        HeroStats stats,
        int heroHealthAtStart,
        int heroManaAtStart,
        Enemy enemy,
        IReadOnlyList<BattleAction> actions)
    {
        var kit = ClassAbilities.For(heroClass);
        var heroHealth = Math.Max(0, heroHealthAtStart);
        var heroMana = Math.Max(0, Math.Min(stats.Mana, heroManaAtStart));
        var enemyHealth = enemy.Health;
        var rounds = new List<CombatRound>();

        for (var index = 0; index < actions.Count; index++)
        {
            if (enemyHealth <= 0 || heroHealth <= 0) break;

            var round = index + 1;
            var slot = actions[index];

            // Si la secuencia trajera una ranura ajena al kit (dato corrupto o
            // nudado a mano) se cae al ataque basico en vez de romper la
            // reproduccion: el combate se sigue pudiendo leer.
            var ability = kit.FirstOrDefault(candidate => candidate.Action == slot) ?? kit[0];

            // El maná se recupera antes de pagar, para que la reserva se recupere
            // sola aunque el jugador solo pueda usar el ataque basico.
            heroMana = Math.Min(stats.Mana, heroMana + ClassAbilities.ManaRegen(stats));
            heroMana -= ClassAbilities.ManaCost(stats, ability);
            heroMana = Math.Max(0, heroMana);

            var heroDamage = DamageFor(ability, stats, enemy);
            enemyHealth = Math.Max(0, enemyHealth - heroDamage);

            // Las habilidades de soporte (Guardia, Escudo) no golpean al enemigo,
            // asi que no pueden rematarlo: en esos turnos el enemigo no
            // contraataca y el heroe recupera el control del combate.
            var skipsCounterAttack = ability.Effect is AbilityEffect.Guard or AbilityEffect.Heal
                || enemyHealth <= 0;

            if (!skipsCounterAttack)
            {
                // Sanar antes del contraataque hace que la curacion tenga coste
                // real: no protege al heroe, solo le devuelve vida.
                if (ability.Effect == AbilityEffect.Heal)
                    heroHealth = Math.Min(stats.Health, heroHealth + stats.Health * ability.HealPercent / 100);

                if (ability.Effect == AbilityEffect.Drain)
                    heroHealth = Math.Min(
                        stats.Health, heroHealth + heroDamage * DrainHealPercent / 100);
            }

            if (enemyHealth <= 0)
            {
                rounds.Add(new CombatRound(
                    round, slot, heroDamage, 0, enemyHealth, heroHealth, heroMana,
                    $"Turno {round}: {ability.Name} hace {heroDamage} de daño. ¡{enemy.Name} ha caído!"));

                break;
            }

            var enemyDamage = 0;
            if (!skipsCounterAttack)
            {
                var incoming = Math.Max(1, enemy.Attack - stats.Defense);

                enemyDamage = ability.Effect == AbilityEffect.Guard
                    ? Math.Max(1, incoming * GuardMultiplierPercent / 100)
                    : incoming;

                heroHealth = Math.Max(0, heroHealth - enemyDamage);
            }

            rounds.Add(new CombatRound(
                round, slot, heroDamage, enemyDamage, enemyHealth, heroHealth, heroMana,
                BuildRoundMessage(round, ability, heroDamage, enemyDamage, enemy, heroHealth)));
        }

        var victory = enemyHealth <= 0;

        return new BattleReplay(
            Victory: victory,
            Finished: victory || heroHealth <= 0,
            EnemyHealth: enemyHealth,
            HeroHealth: heroHealth,
            HeroMana: heroMana,
            Rounds: rounds,
            ExperienceGained: victory ? enemy.ExperienceReward : 0,
            GoldGained: victory ? enemy.GoldReward : 0);
    }

    private static string BuildRoundMessage(
        int round,
        ClassAbility ability,
        int heroDamage,
        int enemyDamage,
        Enemy enemy,
        int heroHealth) => ability.Effect switch
        {
            AbilityEffect.Guard =>
                $"Turno {round}: {ability.Name} y el golpe de {enemy.Name} rebota: {enemyDamage} de daño. Tu vida: {heroHealth}.",

            AbilityEffect.Heal =>
                $"Turno {round}: {ability.Name} recupera vida antes del contraataque. {enemy.Name} responde con {enemyDamage}. Tu vida: {heroHealth}.",

            AbilityEffect.Drain =>
                $"Turno {round}: {ability.Name} hace {heroDamage} de daño y le roba vida. " +
                $"{enemy.Name} responde con {enemyDamage}. Tu vida: {heroHealth}.",

            _ =>
                $"Turno {round}: {ability.Name} hace {heroDamage} de daño. " +
                $"{enemy.Name} responde con {enemyDamage}. Tu vida: {heroHealth}."
        };
}
