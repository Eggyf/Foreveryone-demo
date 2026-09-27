using ForEveryone.Heroes.Application.Battles;
using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Queries.GetCurrentBattle;

public record GetCurrentBattleQuery(Guid UserId) : IRequest<BattleStateDto>;

public class GetCurrentBattleQueryHandler : IRequestHandler<GetCurrentBattleQuery, BattleStateDto>
{
    private readonly IHeroRepository _heroRepository;
    private readonly IBattleRepository _battleRepository;

    public GetCurrentBattleQueryHandler(
        IHeroRepository heroRepository, IBattleRepository battleRepository)
    {
        _heroRepository = heroRepository;
        _battleRepository = battleRepository;
    }

    public async Task<BattleStateDto> Handle(
        GetCurrentBattleQuery request, CancellationToken cancellationToken)
    {
        var battle = await _battleRepository.GetActiveByHeroIdAsync(request.UserId);
        if (battle is null)
            throw BattleError.NotFound("No tienes ningún combate en curso.");

        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null)
            throw BattleError.NotFound("El usuario no tiene un héroe.");

        var enemy = EnemyCatalog.FindByKey(battle.EnemyKey)!;
        return BattleStateBuilder.Build(hero, battle, enemy, applyRewards: false);
    }
}
