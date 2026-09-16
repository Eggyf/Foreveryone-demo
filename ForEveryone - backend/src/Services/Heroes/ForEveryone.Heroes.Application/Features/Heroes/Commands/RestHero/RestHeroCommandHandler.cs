using ForEveryone.Heroes.Application.Exceptions;
using Heroes.Application.Interfaces;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.RestHero;

public class RestHeroCommandHandler : IRequestHandler<RestHeroCommand, RestHeroResult>
{
    private readonly IHeroRepository _heroRepository;

    public RestHeroCommandHandler(IHeroRepository heroRepository)
    {
        _heroRepository = heroRepository;
    }

    public async Task<RestHeroResult> Handle(RestHeroCommand request, CancellationToken cancellationToken)
    {
        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null) throw new NotFoundException("Héroe no encontrado.");

        hero.Rest();
        await _heroRepository.UpdateAsync(hero);

        return new RestHeroResult(hero.CurrentHealth, "Tu héroe ha descansado y recuperado su vida.");
    }
}