using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.FightBattle;

public class FightBattleCommandHandler
    : IRequestHandler<FightBattleCommand, FightBattleResult>
{
    private readonly IHeroRepository _heroRepository;

    public FightBattleCommandHandler(IHeroRepository heroRepository)
    {
        _heroRepository = heroRepository;
    }

    public async Task<FightBattleResult> Handle(
        FightBattleCommand request,
        CancellationToken cancellationToken)
    {
        var enemy = EnemyCatalog.FindByKey(request.EnemyKey);
        if (enemy is null)
            throw new NotFoundException("Ese enemigo no existe en este reino.");

        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null)
            throw new NotFoundException("El usuario no tiene un héroe.");

        if (hero.IsDefeated)
            throw new InvalidOperationException(
                "Tu héroe está derrotado. ¡Debe descansar antes de luchar!");

        var outcome = BattleEngine.Run(hero, enemy);

        // La batalla ya mutó al heroe (vida, experiencia y oro), asi que basta
        // con persistir el agregado.
        await _heroRepository.UpdateAsync(hero);

        return new FightBattleResult(
            outcome.Victory,
            outcome.Enemy.Key,
            outcome.Enemy.Name,
            outcome.Enemy.Health,
            outcome.Enemy.Attack,
            outcome.Enemy.Defense,
            outcome.Rounds
                .Select(r => new BattleRoundResult(
                    r.Round, r.HeroDamage, r.EnemyDamage,
                    r.EnemyHealthRemaining, r.HeroHealthRemaining, r.Message))
                .ToList(),
            outcome.ExperienceGained,
            outcome.GoldGained,
            outcome.LevelBefore,
            outcome.LevelAfter,
            outcome.Message);
    }
}
