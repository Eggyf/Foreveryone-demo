using ForEveryone.Heroes.Application.Exceptions;
using Heroes.Application.Interfaces;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.BuyItem;

public class BuyItemCommandHandler : IRequestHandler<BuyItemCommand, BuyItemResult>
{
    private readonly IHeroRepository _heroRepository;
    private readonly IShopCatalogService _shopCatalogService;

    public BuyItemCommandHandler(IHeroRepository heroRepository, IShopCatalogService shopCatalogService)
    {
        _heroRepository = heroRepository;
        _shopCatalogService = shopCatalogService;
    }

    public async Task<BuyItemResult> Handle(BuyItemCommand request, CancellationToken cancellationToken)
    {
        var hero = await _heroRepository.GetByUserIdAsync(request.UserId);
        if (hero is null)
            throw new NotFoundException("Héroe no encontrado.");

        // Heroes consulta a Shop para validar el objeto y aplicar sus efectos.
        var item = await _shopCatalogService.GetItemByIdAsync(request.ItemId);
        if (item is null)
            throw new NotFoundException("El item no existe en la tienda de Shop.");

        // El dominio valida si hay oro suficiente y aplica el boost
        hero.PurchaseItem(item.Cost, item.AttackBoost, item.DefenseBoost, item.HealToFull);
        await _heroRepository.UpdateAsync(hero);

        return new BuyItemResult("¡Compra exitosa!", hero.Gold);
    }
}