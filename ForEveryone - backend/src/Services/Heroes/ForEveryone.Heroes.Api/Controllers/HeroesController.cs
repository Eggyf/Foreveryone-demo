using ForEveryone.Heroes.Application.Exceptions;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;
using ForEveryone.Heroes.Domain;
using ForEveryone.SharedKernel;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.PlayBattleTurn;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;
using ForEveryone.Heroes.Application.Features.Heroes.Queries.GetCharacterOptions;
using ForEveryone.Heroes.Application.Features.Heroes.Queries.GetCurrentBattle;
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
            return BadRequest(new LocalizedProblem(ex.Errors.FirstOrDefault()!, ex.Errors));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new LocalizedProblem(ex.Text));
        }
        catch (ConflictException ex)
        {
            return Conflict(new LocalizedProblem(ex.Text));
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
                nameKey = enemy.NameKey,
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
    /// Inicia un combate por turnos contra el enemigo indicado en el cuerpo.
    /// </summary>
    [HttpPost("{userId:guid}/battle")]
    public async Task<IActionResult> StartBattle(Guid userId, [FromBody] StartBattleCommand command)
    {
        try
        {
            return Ok(await _mediator.Send(command with { UserId = userId }));
        }
        catch (ValidationException ex)
        {
                return ToValidationProblem(ex);
        }
        catch (BattleError ex)
        {
                return ToBattleProblem(ex);
        }
    }

    /// <summary>
    /// Juega un turno: el jugador elige accion y el servidor devuelve el nuevo
    /// estado. El limite de usos de la habilidad se comprueba aqui, no en el
    /// cliente.
    /// </summary>
    [HttpPost("{userId:guid}/battle/{battleId:guid}/turn")]
    public async Task<IActionResult> PlayTurn(
        Guid userId, Guid battleId, [FromBody] PlayBattleTurnCommand command)
    {
        try
        {
            return Ok(await _mediator.Send(
                command with { UserId = userId, BattleId = battleId }));
        }
        catch (ValidationException ex)
        {
                return ToValidationProblem(ex);
        }
        catch (BattleError ex)
        {
                return ToBattleProblem(ex);
        }
    }

    /// <summary>
    /// Combate en curso, para que el cliente pueda retomarlo al recargar la pagina.
    /// </summary>
    [HttpGet("{userId:guid}/battle")]
    public async Task<IActionResult> GetCurrentBattle(Guid userId)
    {
        try
        {
            return Ok(await _mediator.Send(new GetCurrentBattleQuery(userId)));
        }
        catch (ValidationException ex)
        {
                return ToValidationProblem(ex);
        }
        catch (BattleError ex)
        {
                return ToBattleProblem(ex);
        }
    }

    /// El texto sale como clave y argumentos, no redactado: el cliente lo
    /// traduce. El codigo HTTP lo decide <see cref="BattleError.Kind"/>.
    /// </summary>
    private ObjectResult ToBattleProblem(BattleError ex) => ex.Kind switch
    {
        BattleErrorKind.NotFound => NotFound(new LocalizedProblem(ex.Text)),
        BattleErrorKind.Conflict => Conflict(new LocalizedProblem(ex.Text)),
        BattleErrorKind.Invalid => BadRequest(new LocalizedProblem(ex.Text, ex.Errors)),
        _ => StatusCode(StatusCodes.Status500InternalServerError, new LocalizedProblem(ex.Text))
    };

    /// <summary>
    /// Traduce los fallos de FluentValidation, que el pipeline lanza antes de
    /// que el handler llegue a ejecutarse.
    /// </summary>
    private ObjectResult ToValidationProblem(ValidationException ex) =>
        BadRequest(new LocalizedProblem(ex.Errors.FirstOrDefault()!, ex.Errors));

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
            return NotFound(new LocalizedProblem(ex.Text));
        }
        catch (HeroRuleException ex)
        {
            // El dominio lanza HeroRuleException cuando el heroe esta derrotado y
            // no puede aventurarse. El texto lo compone el cliente.
            return Conflict(new LocalizedProblem(ex.Text));
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
            return NotFound(new LocalizedProblem(ex.Text));
        }
    }
}