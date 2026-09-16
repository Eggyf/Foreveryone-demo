using ForEveryone.Kingdom.Application.Exceptions;
using ForEveryone.Kingdom.Application.Interfaces;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.TrainArmy;

public class TrainArmyCommandHandler : IRequestHandler<TrainArmyCommand, TrainArmyResult>
{
    private readonly IKingdomRepository _kingdomRepository;

    public TrainArmyCommandHandler(IKingdomRepository kingdomRepository)
    {
        _kingdomRepository = kingdomRepository;
    }

    public async Task<TrainArmyResult> Handle(TrainArmyCommand request, CancellationToken cancellationToken)
    {
        var kingdom = await _kingdomRepository.GetByUserIdAsync(request.UserId);
        if (kingdom is null)
            throw new NotFoundException("El usuario no tiene un reino.");

        // El dominio valida si hay Cuartel y si hay recursos
        kingdom.TrainSoldiers(request.Amount);
        await _kingdomRepository.UpdateAsync(kingdom);

        return new TrainArmyResult(kingdom.ArmySize, kingdom.GetMilitaryPower(), "Tropas entrenadas con éxito.");
    }
}