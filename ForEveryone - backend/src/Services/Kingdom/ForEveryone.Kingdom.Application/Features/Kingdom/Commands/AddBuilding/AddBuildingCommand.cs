using ForEveryone.Kingdom.Domain;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.AddBuilding;

// El comando recibe el UserId y el tipo de edificio a construir
public record AddBuildingCommand(Guid UserId, BuildingType BuildingType) : IRequest<AddBuildingResult>;
public record AddBuildingResult(string BuildingName, int Level);