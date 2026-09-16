using ForEveryone.Kingdom.Application.Exceptions;
using ForEveryone.Kingdom.Application.Features.Kingdom.Commands.AddBuilding;

using ForEveryone.Kingdom.Application.Interfaces;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.AddBuilding;

public class AddBuildingCommandHandler : IRequestHandler<AddBuildingCommand, AddBuildingResult>
{
    private readonly IKingdomRepository _kingdomRepository;

    public AddBuildingCommandHandler(IKingdomRepository kingdomRepository)
    {
        _kingdomRepository = kingdomRepository;
    }

    public async Task<AddBuildingResult> Handle(AddBuildingCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscamos el reino del usuario
        var kingdom = await _kingdomRepository.GetByUserIdAsync(request.UserId);
        if (kingdom is null)
            throw new NotFoundException("El usuario no tiene un reino.");

        // 2. El Aggregate Root valida si hay recursos y añade el edificio.
        // Si no hay recursos, el dominio lanzará una InvalidOperationException
        kingdom.AddBuilding(request.BuildingType);

        // 3. Guardamos los cambios
        await _kingdomRepository.UpdateAsync(kingdom);

        return new AddBuildingResult(request.BuildingType.ToString(), 1);
    }
}