using ForEveryone.Heroes.Application.Exceptions;
using Heroes.Application.Interfaces;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.BuyItem;

public class BuyItemCommandHandler : IRequestHandler<BuyItemCommand, BuyItemResult>
{
    private readonly IHeroRepository _heroRepository;

    public BuyItemCommandHandler(IHeroRepository heroRepository)
    {
        _heroRepository = heroRepository;
    }

    public async Task<BuyItemResult> Handle(BuyItemCommand request, CancellationToken cancellationToken)
    {
        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null)
            throw new NotFoundException("Héroe no encontrado.");

        int cost = 0, attackBoost = 0, defenseBoost = 0;
        bool healToFull = false;

        // Definir lo que hace cada item
        switch (request.ItemId.ToLower())
        {
            case "sword":
                cost = 100; attackBoost = 10;
                break;
            case "armor":
                cost = 150; defenseBoost = 10;
                break;
            case "potion":
                cost = 50; healToFull = true;
                break;
            default:
                throw new ArgumentException("El item no existe en la tienda.");
        }

        // El dominio valida si hay oro suficiente y aplica el boost
        hero.PurchaseItem(cost, attackBoost, defenseBoost, healToFull);
        await _heroRepository.UpdateAsync(hero);

        return new BuyItemResult("¡Compra exitosa!", hero.Gold);
    }
}