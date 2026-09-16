using ForEveryone.Kingdom.Application.Exceptions;
using ForEveryone.Kingdom.Application.Features.Kingdom.Commands.CreateKingdom;
using ForEveryone.Kingdom.Application.Features.Kingdom.Queries.GetKingdom;
using ForEveryone.Kingdom.Application.Features.Kingdom.Commands.AddBuilding;
using ForEveryone.Kingdom.Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ForEveryone.Kingdom.Application.Features.Kingdom.Commands.UpgradeBuilding;
using ForEveryone.Kingdom.Application.Features.Kingdom.Commands.TrainArmy;

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

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetKingdom(Guid userId)
    {
        var result = await _mediator.Send(new GetKingdomQuery(userId));
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{userId:guid}/buildings")]
    public async Task<IActionResult> AddBuilding(Guid userId, [FromBody] AddBuildingRequest request)
    {
        try
        {
            var command = new AddBuildingCommand(userId, (BuildingType)request.BuildingType);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            // 400 Bad Request: Lanzado por el dominio si no hay recursos o el edificio ya existe
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{userId:guid}/buildings/upgrade")]
    public async Task<IActionResult> UpgradeBuilding(Guid userId, [FromBody] UpgradeBuildingRequest request)
    {
        try
        {
            var command = new UpgradeBuildingCommand(userId, (BuildingType)request.BuildingType);
            var result = await _mediator.Send(command);
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
    }

    [HttpPost("{userId:guid}/army/train")]
    public async Task<IActionResult> TrainArmy(Guid userId, [FromBody] TrainArmyRequest request)
    {
        try
        {
            var command = new TrainArmyCommand(userId, request.Amount);
            var result = await _mediator.Send(command);
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
    }

    public record TrainArmyRequest(int Amount);

    public record UpgradeBuildingRequest(int BuildingType);

    // DTO mínimo para recibir el tipo de edificio del frontend
    public record AddBuildingRequest(int BuildingType);
}