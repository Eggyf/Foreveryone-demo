using ForEveryone.Heroes.Application.Exceptions; // NUEVO USING
using ForEveryone.Heroes.Application.Interfaces;
using ForEveryone.Heroes.Domain;
using Heroes.Application.Interfaces;
using MediatR;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;

public class CreateHeroCommandHandler : IRequestHandler<CreateHeroCommand, CreateHeroResult>
{
    private readonly IHeroRepository _heroRepository;
    private readonly IUserVerificationService _userVerificationService;

    public CreateHeroCommandHandler(IHeroRepository heroRepository, IUserVerificationService userVerificationService)
    {
        _heroRepository = heroRepository;
        _userVerificationService = userVerificationService;
    }

    public async Task<CreateHeroResult> Handle(CreateHeroCommand request, CancellationToken cancellationToken)
    {
        // 1. Comunicación entre microservicios
        var userExists = await _userVerificationService.VerifyUserExistsAsync(request.UserId);
        if (!userExists)
            throw new NotFoundException("El usuario no existe en el sistema de Identity.");

        // 2. Regla de Dominio: 1 héroe por usuario
        if (await _heroRepository.ExistsByUserIdAsync(request.UserId))
            throw new ConflictException("El usuario ya posee un héroe.");

        // 3. Estadísticas base de la clase. El bonus de la raza lo aplica
        //    el propio Hero en su constructor.
        var baseStats = ClassBonus.For(request.Class);

        // 4. Crear Aggregate
        var hero = new Hero(Guid.NewGuid(), request.UserId, request.Race, request.Class, baseStats);

        // 5. Persistencia
        await _heroRepository.AddAsync(hero);

        return new CreateHeroResult(hero.Id, hero.UserId, hero.Race.ToString(), hero.Class.ToString());
    }
}
