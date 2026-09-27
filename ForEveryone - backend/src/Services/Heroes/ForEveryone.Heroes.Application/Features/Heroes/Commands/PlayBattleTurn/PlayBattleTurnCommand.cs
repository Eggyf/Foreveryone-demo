using ForEveryone.Heroes.Domain;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.PlayBattleTurn;

public record PlayBattleTurnCommand(Guid UserId, Guid BattleId, BattleAction Action)
    : IRequest<StartBattle.BattleStateDto>;
