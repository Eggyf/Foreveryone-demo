using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Application.Users.Commands.LoginUser;

/// <summary>
/// <paramref name="Identifier"/> admite tanto el email como el nombre de usuario:
/// el handler decide cual usar segun el formato recibido.
/// </summary>
public sealed record LoginUserCommand(string Identifier, string Password)
    : ICommand<LoginUserResponse>;

public sealed record LoginUserResponse(string Token, Guid UserId, string Username, string Email);
