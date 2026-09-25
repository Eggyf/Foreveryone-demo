using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Application.Users.Commands.RegisterUser;

public sealed record RegisterUserCommand(string Username, string Email, string Password)
    : ICommand<RegisterUserResponse>;

public sealed record RegisterUserResponse(Guid UserId, string Username, string Email);
