using ForEveryone.Heroes.Application.Exceptions; // NUEVO USING
using ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.FightBattle;
using ForEveryone.Heroes.Application.Features.Heroes.Queries.GetCharacterOptions;
using ForEveryone.Heroes.Application.Features.Heroes.Queries.GetHero;
using Heroes.Application.Features.Heroes.Commands.EmbarkOnAdventure;
using Heroes.Application.Features.Heroes.Commands.RestHero;
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
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message, errors = ex.Errors }); // Devuelve 400
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

    [HttpGet("options")]
    public async Task<IActionResult> GetCharacterOptions()
    {
        var result = await _mediator.Send(new GetCharacterOptionsResult(
            Array.Empty<CharacterRaceOption>(),
            Array.Empty<CharacterClassOption>()));
        return Ok(result);
    }

    /// <summary>
    /// Enemigos disponibles. Se expone desde el dominio para que el cliente
    /// no duplique las recompensas ni las estadisticas de combate.
    /// </summary>
    [HttpGet("enemies")]
    public IActionResult GetEnemies()
    {
        var enemies = ForEveryone.Heroes.Domain.EnemyCatalog.All
            .Select(enemy => new
            {
                key = enemy.Key,
                name = enemy.Name,
                health = enemy.Health,
                attack = enemy.Attack,
                defense = enemy.Defense,
                experienceReward = enemy.ExperienceReward,
                goldReward = enemy.GoldReward
            })
            .ToList();

        return Ok(enemies);
    }

    /// <summary>
    /// Pelatea por turnos contra el enemigo indicado en el cuerpo.
    /// </summary>
    [HttpPost("{userId:guid}/battle")]
    public async Task<IActionResult> FightBattle(Guid userId, [FromBody] FightBattleCommand command)
    {
        try
        {
            var result = await _mediator.Send(command with { UserId = userId });
            return Ok(result);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message, errors = ex.Errors });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            // El heroe esta derrotado: no es un fallo del servidor sino un
            // estado del juego, asi que responde 409 y no 500.
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetHero(Guid userId)
    {
        var result = await _mediator.Send(new GetHeroQuery(userId));
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{userId:guid}/adventure")]
    public async Task<IActionResult> EmbarkOnAdventure(Guid userId)
    {
        try
        {
            var result = await _mediator.Send(new EmbarkOnAdventureCommand(userId));
            return Ok(result);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
    [HttpPost("{userId:guid}/rest")]
    public async Task<IActionResult> RestHero(Guid userId)
    {
        try
        {
            var result = await _mediator.Send(new RestHeroCommand(userId));
            return Ok(result);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}