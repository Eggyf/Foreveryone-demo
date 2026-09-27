using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.EmbarkOnAdventure;

/// <summary>
/// Aventura heredada de una sola llamada: pelea contra un goblin usando siempre
/// el ataque normal. Se mantiene por compatibilidad, pero la partida de verdad
/// es la de <c>/api/heroes/{userId}/battle</c>, donde el jugador elige la accion
/// en cada turno.
/// </summary>
public class EmbarkOnAdventureCommandHandler : IRequestHandler<EmbarkOnAdventureCommand, AdventureResult>
{
    private readonly IHeroRepository _heroRepository;

    public EmbarkOnAdventureCommandHandler(IHeroRepository heroRepository)
    {
        _heroRepository = heroRepository;
    }

    public async Task<AdventureResult> Handle(EmbarkOnAdventureCommand request, CancellationToken cancellationToken)
    {
        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null) throw new NotFoundException("El usuario no tiene un héroe.");

        if (hero.IsDefeated)
            throw new InvalidOperationException("Tu héroe está derrotado. ¡Debe descansar antes de aventurarse!");

        // Se reproduce el combate con una accion de ataque normal por turno, que
        // es exactamente lo que hacia la version anterior de este handler.
        var enemy = Enemy.Goblin;
        var actions = PlanAttackOnlyTurns(hero, enemy);

        var replay = BattleEngine.Replay(hero.Stats, hero.CurrentHealth, enemy, actions);

        hero.SetHealthFromBattle(replay.HeroHealth);

        if (replay.Victory)
        {
            hero.GainExperience(replay.ExperienceGained);
            hero.AddGold(replay.GoldGained);
        }

        await _heroRepository.UpdateAsync(hero);

        var message = replay.Victory
            ? $"¡Victoria contra {enemy.Name}! Ganaste {replay.ExperienceGained} de experiencia y {replay.GoldGained} de oro."
            : $"Has sido derrotado por {enemy.Name}. Tu héroe necesita descansar.";

        return new AdventureResult(
            replay.Victory,
            replay.ExperienceGained,
            hero.Level,
            hero.Level,
            message);
    }

    /// <summary>
    /// Cuantos turnos hacen falta, contando solo ataques normales. Como el motor
    /// es determinista, basta con tantos ataques como haga falta.
    /// </summary>
    private static List<BattleAction> PlanAttackOnlyTurns(Hero hero, Enemy enemy)
    {
        var actions = new List<BattleAction>();
        var enemyHealth = enemy.Health;
        var heroHealth = hero.CurrentHealth;

        while (enemyHealth > 0 && heroHealth > 0)
        {
            actions.Add(BattleAction.Attack);
            enemyHealth -= BattleEngine.DamageFor(BattleAction.Attack, hero.Stats, enemy);

            if (enemyHealth > 0)
                heroHealth -= Math.Max(1, enemy.Attack - hero.Stats.Defense);
        }

        return actions;
    }
}
