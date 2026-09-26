using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.EmbarkOnAdventure;

/// <summary>
/// Aventura heredada: pelea contra un goblin. Se mantiene para no romper
/// clientes existentes, pero delega el combate en <see cref="BattleEngine"/>
/// en lugar de reimplementar la lógica de turnos.
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

        var outcome = BattleEngine.Run(hero, Enemy.Goblin);
        await _heroRepository.UpdateAsync(hero);

        return new AdventureResult(
            outcome.Victory,
            outcome.ExperienceGained,
            outcome.LevelBefore,
            outcome.LevelAfter,
            outcome.Message);
    }
}
