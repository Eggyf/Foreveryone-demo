using ForEveryone.Kingdom.Application.Exceptions;
using ForEveryone.Kingdom.Application.Interfaces;
using ForEveryone.Kingdom.Domain;
using MediatR;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.CreateKingdom;

public class CreateKingdomCommandHandler : IRequestHandler<CreateKingdomCommand, CreateKingdomResult>
{
    private readonly IKingdomRepository _kingdomRepository;
    private readonly IUserVerificationService _userVerificationService;

    public CreateKingdomCommandHandler(IKingdomRepository kingdomRepository, IUserVerificationService userVerificationService)
    {
        _kingdomRepository = kingdomRepository;
        _userVerificationService = userVerificationService;
    }

    public async Task<CreateKingdomResult> Handle(CreateKingdomCommand request, CancellationToken cancellationToken)
    {
        var userExists = await _userVerificationService.VerifyUserExistsAsync(request.UserId);
        if (!userExists)
            throw new NotFoundException("El usuario no existe en el sistema de Identity.");

        if (await _kingdomRepository.ExistsByUserIdAsync(request.UserId))
            throw new ConflictException("El usuario ya posee un reino.");

        var kingdom = new Kingdoms(Guid.NewGuid(), request.UserId);

        await _kingdomRepository.AddAsync(kingdom);

        return new CreateKingdomResult(kingdom.Id, kingdom.UserId, kingdom.CastleLevel);
    }
}