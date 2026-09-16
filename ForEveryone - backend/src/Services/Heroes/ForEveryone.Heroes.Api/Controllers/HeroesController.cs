using ForEveryone.Heroes.Application.Exceptions; // NUEVO USING
using ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;
using ForEveryone.Heroes.Application.Features.Heroes.Queries.GetHero;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ForEveryone.Heroes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HeroesController : ControllerBase
{
    private readonly IMediator _mediator;

    public HeroesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateHero([FromBody] CreateHeroCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(CreateHero), new { id = result.HeroId }, result);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message }); // Devuelve 404
        }
        catch (ConflictException ex)
        {
            return Conflict(new { message = ex.Message }); // Devuelve 409
        }
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetHero(Guid userId)
    {
        var result = await _mediator.Send(new GetHeroQuery(userId));
        if (result is null) return NotFound();
        return Ok(result);
    }
}