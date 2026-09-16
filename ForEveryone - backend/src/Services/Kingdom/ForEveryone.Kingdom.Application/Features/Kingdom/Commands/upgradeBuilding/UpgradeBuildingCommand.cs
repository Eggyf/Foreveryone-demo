using ForEveryone.Kingdom.Domain;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.UpgradeBuilding;

public record UpgradeBuildingCommand(Guid UserId, BuildingType BuildingType) : IRequest<UpgradeBuildingResult>;
public record UpgradeBuildingResult(string BuildingName, int NewLevel);