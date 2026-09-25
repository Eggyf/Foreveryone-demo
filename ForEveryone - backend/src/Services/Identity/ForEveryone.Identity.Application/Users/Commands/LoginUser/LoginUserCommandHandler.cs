using ForEveryone.Identity.Application.Common.Interfaces;
using ForEveryone.Identity.Domain;
using ForEveryone.Identity.Domain.Entities;
using ForEveryone.Identity.Domain.Repositories;
using ForEveryone.Identity.Domain.ValueObjects;
using ForEveryone.SharedKernel;
using MediatR;

namespace ForEveryone.Identity.Application.Users.Commands.LoginUser;

public sealed class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, Result<LoginUserResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginUserCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result<LoginUserResponse>> Handle(
        LoginUserCommand request,
        CancellationToken cancellationToken)
    {
        var user = await FindUserAsync(request.Identifier, cancellationToken);
        if (user is null)
            return Result.Failure<LoginUserResponse>(DomainErrors.User.InvalidCredentials);

        if (!user.IsActive)
            return Result.Failure<LoginUserResponse>(DomainErrors.User.InactiveAccount);

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<LoginUserResponse>(DomainErrors.User.InvalidCredentials);

        var token = _jwtTokenGenerator.GenerateToken(user);

        return Result.Success(
            new LoginUserResponse(token, user.Id, user.Username.Value, user.Email.Value));
    }

    /// <summary>
    /// Resuelve el usuario por email o por nombre de usuario segun el formato
    /// recibido. Cualquier formato invalido devuelve null en lugar de un error
    /// especifico, para no revelar que dato fallo en el login.
    /// </summary>
    private async Task<User?> FindUserAsync(string identifier, CancellationToken cancellationToken)
    {
        identifier = identifier.Trim();

        if (identifier.Contains('@'))
        {
            var emailResult = Email.Create(identifier);
            return emailResult.IsFailure
                ? null
                : await _userRepository.GetByEmailAsync(emailResult.Value, cancellationToken);
        }

        var usernameResult = Username.Create(identifier);
        return usernameResult.IsFailure
            ? null
            : await _userRepository.GetByUsernameAsync(usernameResult.Value, cancellationToken);
    }
}
