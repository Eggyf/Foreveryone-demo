using ForEveryone.Heroes.Application.Battles;
using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.PlayBattleTurn;

public class PlayBattleTurnCommandHandler
    : IRequestHandler<PlayBattleTurnCommand, BattleStateDto>
{
    private readonly IHeroRepository _heroRepository;
    private readonly IBattleRepository _battleRepository;

    public PlayBattleTurnCommandHandler(
        IHeroRepository heroRepository, IBattleRepository battleRepository)
    {
        _heroRepository = heroRepository;
        _battleRepository = battleRepository;
    }

    public async Task<BattleStateDto> Handle(
        PlayBattleTurnCommand request, CancellationToken cancellationToken)
    {
        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null)
            throw BattleError.NotFound("El usuario no tiene un héroe.");

        var battle = await _battleRepository.GetByIdAsync(request.BattleId);
        if (battle is null || battle.HeroId != request.UserId)
            throw BattleError.NotFound("El combate no existe.");

        if (battle.IsFinished)
            throw BattleError.Conflict("El combate ya ha terminado.");

        // La habilidad tiene un limite de usos: lo comprueba el servidor y no el
        // cliente, para que no se pueda saltar el limite desde el navegador.
        if (!BattleEngine.IsAvailable(request.Action, battle.Actions))
            throw BattleError.Conflict("No tienes usos disponibles de esa acción.");

        battle.Play(request.Action);

        var enemy = EnemyCatalog.FindByKey(battle.EnemyKey)!;
        var replay = BattleEngine.Replay(hero.Stats, battle.HeroHealthAtStart, enemy, battle.Actions);

        // El dano se descuenta al heroe en cuanto ocurre el turno, no al cerrar
        // el combate. Asi, abandonar la pelea a medias tambien cuesta vida.
        hero.SetHealthFromBattle(replay.HeroHealth);

        var applyRewards = false;
        if (replay.Finished)
        {
            battle.Finish(replay.Victory);

            if (replay.Victory)
            {
                hero.GainExperience(replay.ExperienceGained);
                hero.AddGold(replay.GoldGained);
                applyRewards = true;
            }
        }

        await _heroRepository.UpdateAsync(hero);
        await _battleRepository.UpdateAsync(battle);

        return BattleStateBuilder.Build(hero, battle, enemy, applyRewards);
    }
}
