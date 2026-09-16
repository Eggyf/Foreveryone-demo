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
        if (hero is null)
            throw new NotFoundException("El usuario no tiene un héroe.");

        // Simulación de combate (MVP)
        var random = Random.Shared;

        // El héroe tira sus dados (Ataque + random 1-20)
        int heroRoll = hero.Stats.Attack + random.Next(1, 20);

        // El monstruo (Goblin genérico) tira sus dados (Defensa 10 + random 1-20)
        int monsterRoll = 10 + random.Next(1, 20);

        int levelBefore = hero.Level;

        if (heroRoll > monsterRoll)
        {
            // ¡Victoria! El héroe gana 50 de experiencia
            int expGained = 50;
            hero.GainExperience(expGained);
            await _heroRepository.UpdateAsync(hero);

            string msg = hero.Level > levelBefore
                ? $"¡Victoria! Ganaste {expGained} de experiencia. ¡HAS SUBIDO AL NIVEL {hero.Level}!"
                : $"¡Victoria! Ganaste {expGained} de experiencia.";

            return new AdventureResult(true, expGained, levelBefore, hero.Level, msg);
        }
        else
        {
            // Derrota (no pierde experiencia en este MVP)
            return new AdventureResult(false, 0, levelBefore, hero.Level, "Has sido derrotado en la aventura...");
        }
    }
}