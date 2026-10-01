using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.SharedKernel;
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
        if (hero is null) throw new NotFoundException("hero.error.notFound");

        hero.Rest();
        await _heroRepository.UpdateAsync(hero);

        return new RestHeroResult(hero.CurrentHealth, LocalizedText.Of("hero.message.rested"));
    }
}