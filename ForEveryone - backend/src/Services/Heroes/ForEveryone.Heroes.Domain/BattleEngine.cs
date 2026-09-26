namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Resuelve el combate por turnos entre un heroe y un enemigo.
/// Es logica de dominio pura: no toca base de datos ni conoce la capa de
/// aplicacion, por lo que se puede razonar y probar de forma aislada.
/// La batalla es determinista: sin azar, el resultado depende solo de las
/// estadisticas, lo que hace que el combate sea predecible y justo.
/// </summary>
public static class BattleEngine
{
    /// <summary>
    /// Lanza el combate. El heroe siempre ataca primero y el dano nunca baja
    /// de 1 punto, de modo que un enemigo con mucha defensa no puede hacer que
    /// la pelea se eternice ni que el heroe quede invulnerable.
    /// </summary>
    public static BattleOutcome Run(Hero hero, Enemy enemy)
    {
        ArgumentNullException.ThrowIfNull(hero);
        ArgumentNullException.ThrowIfNull(enemy);

        var levelBefore = hero.Level;
        var enemyHealth = enemy.Health;
        var rounds = new List<CombatRound>();
        var round = 0;

        while (enemyHealth > 0 && !hero.IsDefeated)
        {
            round++;

            // Turno del heroe: golpea al enemigo. Ataca primero, siempre.
            var heroDamage = Math.Max(1, hero.Stats.Attack - enemy.Defense);
            enemyHealth = Math.Max(0, enemyHealth - heroDamage);

            // Si el enemigo muere con ese golpe, no contraataca.
            if (enemyHealth <= 0)
            {
                rounds.Add(new CombatRound(
                    round, heroDamage, 0, enemyHealth,
                    hero.CurrentHealth,
                    $"Turno {round}: Causes {heroDamage} de daño. ¡{enemy.Name} ha caído!"));

                return Victory(hero, enemy, rounds, levelBefore);
            }

            // Turno del enemigo: contraataca.
            var enemyDamage = Math.Max(1, enemy.Attack - hero.Stats.Defense);
            hero.TakeDamage(enemyDamage);

            rounds.Add(new CombatRound(
                round, heroDamage, enemyDamage, enemyHealth,
                hero.CurrentHealth,
                $"Turno {round}: {hero.Stats.Attack} contra {enemy.Defense} hace {heroDamage} de daño. " +
                $"{enemy.Name} responde con {enemyDamage}."));
        }

        return new BattleOutcome(
            Victory: false,
            Enemy: enemy,
            Rounds: rounds,
            ExperienceGained: 0,
            GoldGained: 0,
            LevelBefore: levelBefore,
            LevelAfter: hero.Level,
            Message: $"Has sido derrotado por {enemy.Name}. Tu héroe necesita descansar.");
    }

    private static BattleOutcome Victory(
        Hero hero, Enemy enemy, List<CombatRound> rounds, int levelBefore)
    {
        hero.GainExperience(enemy.ExperienceReward);
        hero.AddGold(enemy.GoldReward);

        var leveledUp = hero.Level > levelBefore;

        var message = leveledUp
            ? $"¡Victoria contra {enemy.Name}! Ganaste {enemy.ExperienceReward} de experiencia " +
              $"y {enemy.GoldReward} de oro. ¡Subes al nivel {hero.Level}!"
            : $"¡Victoria contra {enemy.Name}! Ganaste {enemy.ExperienceReward} de experiencia " +
              $"y {enemy.GoldReward} de oro. Vida restante: {hero.CurrentHealth}/{hero.Stats.Health}.";

        return new BattleOutcome(
            Victory: true,
            Enemy: enemy,
            Rounds: rounds,
            ExperienceGained: enemy.ExperienceReward,
            GoldGained: enemy.GoldReward,
            LevelBefore: levelBefore,
            LevelAfter: hero.Level,
            Message: message);
    }
}
