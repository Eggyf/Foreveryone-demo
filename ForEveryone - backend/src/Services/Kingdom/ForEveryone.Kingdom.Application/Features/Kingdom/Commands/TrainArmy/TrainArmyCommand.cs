using ForEveryone.SharedKernel;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.TrainArmy;

public record TrainArmyCommand(Guid UserId, int Amount) : IRequest<TrainArmyResult>;

/// <summary>
/// El mensaje es una clave de traduccion: el servidor no sabe en que idioma lee
/// el jugador, asi que solo indica qué ocurrió.
/// </summary>
public record TrainArmyResult(int ArmySize, int MilitaryPower, LocalizedText Message);