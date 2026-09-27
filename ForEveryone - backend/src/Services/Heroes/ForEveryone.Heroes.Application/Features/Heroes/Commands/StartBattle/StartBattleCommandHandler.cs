using ForEveryone.Heroes.Application.Battles;
using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;

public class StartBattleCommandHandler
    : IRequestHandler<StartBattleCommand, BattleStateDto>
{
    private readonly IHeroRepository _heroRepository;
    private readonly IBattleRepository _battleRepository;

    public StartBattleCommandHandler(
        IHeroRepository heroRepository, IBattleRepository battleRepository)
    {
        _heroRepository = heroRepository;
        _battleRepository = battleRepository;
    }

    public async Task<BattleStateDto> Handle(
        StartBattleCommand request, CancellationToken cancellationToken)
    {
        var enemy = EnemyCatalog.FindByKey(request.EnemyKey);
        if (enemy is null)
            throw BattleError.NotFound("Ese enemigo no existe en este reino.");

        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null)
            throw BattleError.NotFound("El usuario no tiene un héroe.");

        if (hero.IsDefeated)
            throw BattleError.Conflict("Tu héroe está derrotado. ¡Debe descansar antes de luchar!");

        // Solo se permite un combate abierto por heroe, para que el jugador no
        // pueda abrir varios y Saltarse el dano de alguno.
        if (await _battleRepository.GetActiveByHeroIdAsync(request.UserId) is not null)
            throw BattleError.Conflict("Ya tienes un combate en curso.");

        var battle = Battle.Start(request.UserId, enemy, hero.CurrentHealth);
        await _battleRepository.AddAsync(battle);

        return BattleStateBuilder.Build(hero, battle, enemy, applyRewards: false);
    }
}
