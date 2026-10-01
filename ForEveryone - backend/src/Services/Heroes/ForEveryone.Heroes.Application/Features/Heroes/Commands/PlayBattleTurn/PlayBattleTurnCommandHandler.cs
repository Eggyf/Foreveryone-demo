using ForEveryone.Heroes.Application.Battles;
using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;
using ForEveryone.Heroes.Domain;
using ForEveryone.SharedKernel;
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
            throw BattleError.NotFound(LocalizedText.Of("hero.error.notFound"));

        var battle = await _battleRepository.GetByIdAsync(request.BattleId);
        if (battle is null || battle.HeroId != request.UserId)
            throw BattleError.NotFound(LocalizedText.Of("battle.error.notFound"));

        if (battle.IsFinished)
            throw BattleError.Conflict(LocalizedText.Of("battle.error.alreadyFinished"));

        var enemy = EnemyCatalog.FindByKey(battle.EnemyKey)!;

        // Se reproduce el estado actual para validar contra el maná y los usos
        // que quedan de verdad, no contra lo que el cliente dice que quedan.
        var current = BattleEngine.Replay(
            hero.Class, hero.Stats, battle.HeroHealthAtStart, battle.HeroManaAtStart, enemy, battle.Actions);

        // Las habilidades tienen limite de usos, coste de maná y solo existen si
        // son del kit de la clase. Todo se comprueba aqui, no en el cliente.
        var blocked = BattleEngine.Unavailability(
            request.Action, hero.Class, hero.Stats, current.HeroMana, battle.Actions);

        if (blocked is not null)
            throw BattleError.Conflict(blocked, $"Acción {request.Action} no disponible: {blocked.Key}");

        battle.Play(request.Action);

        var replay = BattleEngine.Replay(
            hero.Class, hero.Stats, battle.HeroHealthAtStart, battle.HeroManaAtStart, enemy, battle.Actions);

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
