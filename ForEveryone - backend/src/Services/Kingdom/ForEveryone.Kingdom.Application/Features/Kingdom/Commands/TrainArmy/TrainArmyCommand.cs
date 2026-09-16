using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.TrainArmy;

public record TrainArmyCommand(Guid UserId, int Amount) : IRequest<TrainArmyResult>;
public record TrainArmyResult(int ArmySize, int MilitaryPower, string Message);