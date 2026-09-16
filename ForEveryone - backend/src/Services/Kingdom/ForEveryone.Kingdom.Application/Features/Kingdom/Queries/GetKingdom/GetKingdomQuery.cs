using MediatR;
using System.Collections.Generic;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Queries.GetKingdom;

public record GetKingdomQuery(Guid UserId) : IRequest<GetKingdomResult?>;

// Aquí definimos el resultado y el DTO del edificio
public record GetKingdomResult(Guid KingdomId, int CastleLevel, int Wood, int Stone, int Gold, int Food, List<BuildingDto> Buildings, int ArmySize, int MilitaryPower);
public record BuildingDto(int Type, string Name, int Level);
