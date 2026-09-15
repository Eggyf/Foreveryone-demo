using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Application.Users.Commands.LoginUser;

public sealed record LoginUserCommand(string Email, string Password) : ICommand<LoginUserResponse>;

public sealed record LoginUserResponse(string Token, Guid UserId, string Email);
