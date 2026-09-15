using ForEveryone.Heroes.Application.Exceptions; // NUEVO USING
using ForEveryone.Heroes.Application.Interfaces;
using ForEveryone.Heroes.Domain;
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

        // 3. Domain Service
        var stats = request.Class switch
        {
            HeroClass.Warrior => new HeroStats(150, 15, 20, 10),
            HeroClass.Mage => new HeroStats(80, 25, 5, 50),
            HeroClass.Archer => new HeroStats(100, 20, 10, 20),
            HeroClass.Priest => new HeroStats(90, 10, 8, 60),
            _ => throw new ArgumentOutOfRangeException(nameof(request.Class))
        };

        // 4. Crear Aggregate
        var hero = new Hero(Guid.NewGuid(), request.UserId, request.Class, stats);

        // 5. Persistencia
        await _heroRepository.AddAsync(hero);

        return new CreateHeroResult(hero.Id, hero.UserId, hero.Class.ToString());
    }
}