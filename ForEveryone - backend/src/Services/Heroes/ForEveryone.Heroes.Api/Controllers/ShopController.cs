using ForEveryone.Heroes.Domain;
using Heroes.Application.Features.Heroes.Commands.BuyItem;
using Heroes.Application.Features.Heroes.Queries.GetShopItems;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.SharedKernel;
namespace Heroes.Api.Controllers;

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

    [HttpPost("{userId:guid}/buy")]
    public async Task<IActionResult> BuyItem(Guid userId, [FromBody] BuyItemRequest request)
    {
        try
        {
            var result = await _mediator.Send(new BuyItemCommand(userId, request.ItemId));
            return Ok(result);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new LocalizedProblem(ex.Text));
        }
        catch (HeroRuleException ex)
        {
            // 400: el dominio rechaza la compra (oro insuficiente, objeto no
            // aplicable). El motivo viaja como clave para que lo traduzca el cliente.
            return BadRequest(new LocalizedProblem(ex.Text));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new LocalizedProblem(
                // El texto original se queda en el log; el cliente recibe la clave.
                LocalizedText.Of("shop.error.invalidRequest"),
                [LocalizedText.Of("shop.error.invalidRequest", ("detail", ex.Message))]));
        }
    }

    public record BuyItemRequest(int ItemId);
}