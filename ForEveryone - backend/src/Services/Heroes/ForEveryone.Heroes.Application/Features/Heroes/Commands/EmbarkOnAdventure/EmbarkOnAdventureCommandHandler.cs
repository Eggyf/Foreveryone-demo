using ForEveryone.Heroes.Application.Exceptions;
using Heroes.Application.Interfaces;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.EmbarkOnAdventure;

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

        // Monstruo Genérico (Goblin)
        int monsterHp = 50;
        int monsterAttack = 12;
        int monsterDefense = 5;

        int levelBefore = hero.Level;

        // Combate por turnos
        while (monsterHp > 0 && !hero.IsDefeated)
        {
            // Turno del Héroe
            int heroDmg = Math.Max(1, hero.Stats.Attack - monsterDefense);
            monsterHp -= heroDmg;

            if (monsterHp <= 0) break; // Si el monstruo muere, termina

            // Turno del Monstruo
            int monsterDmg = Math.Max(1, monsterAttack - hero.Stats.Defense);
            hero.TakeDamage(monsterDmg);
        }

        if (!hero.IsDefeated)
        {
            int expGained = 50;
            int goldGained = 20; // NUEVO: Recompensa de oro
            hero.GainExperience(expGained);
            hero.AddGold(goldGained); // NUEVO
            await _heroRepository.UpdateAsync(hero);

            string msg = hero.Level > levelBefore
                ? $"¡Victoria! Ganaste {expGained} de experiencia y {goldGained} de oro. ¡HAS SUBIDO AL NIVEL {hero.Level}!"
                : $"¡Victoria! Ganaste {expGained} de experiencia y {goldGained} de oro. Vida restante: {hero.CurrentHealth}/{hero.Stats.Health}.";

            return new AdventureResult(true, expGained, levelBefore, hero.Level, msg);
        }
        else
        {
            await _heroRepository.UpdateAsync(hero);
            return new AdventureResult(false, 0, levelBefore, hero.Level, "¡Has sido derrotado en combate! Tu héroe necesita descansar.");
        }
    }
}