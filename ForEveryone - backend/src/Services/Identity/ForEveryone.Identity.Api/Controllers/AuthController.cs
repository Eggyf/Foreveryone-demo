using ForEveryone.Identity.Application.Users.Commands.LoginUser;
using ForEveryone.Identity.Application.Users.Commands.RegisterUser;
using ForEveryone.SharedKernel;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ForEveryone.Identity.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender) => _sender = sender;

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        return result.IsSuccess
            ? StatusCode(StatusCodes.Status201Created, result.Value)
            : ToProblemResult(result.Error);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginUserCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : ToProblemResult(result.Error);
    }

    /// `detail` lleva la clave de traduccion y no el texto: el cliente la
    /// resuelve en el idioma del jugador. Los errores de validacion llegan
    /// indexados por campo en `errors`, tambien como claves.
    /// </summary>
    private ObjectResult ToProblemResult(Error error)
    {
        var statusCode = error.Code switch
        {
            var c when c.StartsWith("Validation") => StatusCodes.Status400BadRequest,
            var c when c.Contains("NotFound") => StatusCodes.Status404NotFound,
            var c when c.Contains("AlreadyInUse") => StatusCodes.Status409Conflict,
            var c when c.Contains("InvalidCredentials") => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status400BadRequest
        };

        var problem = new ProblemDetails
        {
            Detail = error.Description,
            Status = statusCode,
            Title = error.Code
        };

        if (error.Details is { Count: > 0 })
        {
            // Los errores de dominio envian la clave en `key`; los de validacion
            // envian un diccionario campo -> clave. Se distinguen por la forma.
            var isSingleKey = error.Details.Count == 1 && error.Details.ContainsKey("key");

            if (isSingleKey)
            {
                problem.Extensions["message"] = error.Details["key"];
            }
            else
            {
                problem.Extensions["errors"] = error.Details;
            }
        }

        return new ObjectResult(problem) { StatusCode = statusCode };
    }
}
