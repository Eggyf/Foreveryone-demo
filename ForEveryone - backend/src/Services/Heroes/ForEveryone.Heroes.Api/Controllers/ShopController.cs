using Heroes.Application.Features.Heroes.Commands.BuyItem;
using Heroes.Application.Features.Heroes.Queries.GetShopItems;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ForEveryone.Heroes.Application.Exceptions;
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
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public record BuyItemRequest(int ItemId);
}