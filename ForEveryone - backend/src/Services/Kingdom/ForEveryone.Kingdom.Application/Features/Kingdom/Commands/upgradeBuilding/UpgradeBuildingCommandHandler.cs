using ForEveryone.Kingdom.Application.Exceptions;
using ForEveryone.Kingdom.Application.Interfaces;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.UpgradeBuilding;

public class UpgradeBuildingCommandHandler : IRequestHandler<UpgradeBuildingCommand, UpgradeBuildingResult>
{
    private readonly IKingdomRepository _kingdomRepository;

    public UpgradeBuildingCommandHandler(IKingdomRepository kingdomRepository)
    {
        _kingdomRepository = kingdomRepository;
    }

    public async Task<UpgradeBuildingResult> Handle(UpgradeBuildingCommand request, CancellationToken cancellationToken)
    {
        var kingdom = await _kingdomRepository.GetByUserIdAsync(request.UserId);
        if (kingdom is null)
            throw new NotFoundException("El usuario no tiene un reino.");

        // El dominio valida si hay recursos y sube el nivel
        kingdom.UpgradeBuilding(request.BuildingType);
        await _kingdomRepository.UpdateAsync(kingdom);

        var building = kingdom.Buildings.First(b => b.Type == request.BuildingType);
        return new UpgradeBuildingResult(request.BuildingType.ToString(), building.Level);
    }
}