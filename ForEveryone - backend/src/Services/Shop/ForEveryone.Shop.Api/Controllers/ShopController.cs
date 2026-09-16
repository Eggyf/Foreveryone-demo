using ForEveryone.Shop.Application.Features.Items.Queries.GetShopItems; // Asegúrate de tener este using
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ForEveryone.Shop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly IMediator _mediator;

    public ShopController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetShopItems()
    {
        var items = await _mediator.Send(new GetShopItemsQuery());
        return Ok(items);
    }

    // NUEVO: Endpoint interno para que Heroes consulte el item
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetItemById(int id)
    {
        // Reutilizamos el query, pero filtrando por ID en el handler
        var item = await _mediator.Send(new GetShopItemByIdQuery(id));
        if (item is null) return NotFound();
        return Ok(item);
    }
}