using ForEveryone.Identity.Domain.Repositories; // Ajusta al namespace de tu IUserRepository
using Microsoft.AspNetCore.Mvc;

namespace ForEveryone.Identity.Api.Controllers;

[ApiController]
[Route("internal/users")]
public class InternalUsersController : ControllerBase
{
    private readonly IUserRepository _userRepository; // Usa la interfaz que ya creaste en Identity

    public InternalUsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet("{id:guid}/exists")]
    public async Task<IActionResult> UserExists(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null) return NotFound();

        return Ok(new { exists = true });
    }
}