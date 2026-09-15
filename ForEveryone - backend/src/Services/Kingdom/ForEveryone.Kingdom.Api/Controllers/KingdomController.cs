using ForEveryone.Kingdom.Application.Exceptions;
using ForEveryone.Kingdom.Application.Features.Kingdom.Commands.CreateKingdom;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ForEveryone.Kingdom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KingdomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public KingdomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateKingdom([FromBody] CreateKingdomCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(CreateKingdom), new { id = result.KingdomId }, result);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}