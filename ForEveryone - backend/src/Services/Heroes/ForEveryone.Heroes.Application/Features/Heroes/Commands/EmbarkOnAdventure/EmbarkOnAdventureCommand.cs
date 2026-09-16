using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.EmbarkOnAdventure;

public record EmbarkOnAdventureCommand(Guid UserId) : IRequest<AdventureResult>;

public record AdventureResult(bool Victory, int ExperienceGained, int LevelBefore, int LevelAfter, string Message);