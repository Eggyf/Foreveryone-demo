using ForEveryone.Identity.Application.Common.Interfaces;
using ForEveryone.Identity.Domain;
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
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
            return Result.Failure<LoginUserResponse>(DomainErrors.User.InvalidCredentials);

        var user = await _userRepository.GetByEmailAsync(emailResult.Value, cancellationToken);
        if (user is null)
            return Result.Failure<LoginUserResponse>(DomainErrors.User.InvalidCredentials);

        if (!user.IsActive)
            return Result.Failure<LoginUserResponse>(DomainErrors.User.InactiveAccount);

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<LoginUserResponse>(DomainErrors.User.InvalidCredentials);

        var token = _jwtTokenGenerator.GenerateToken(user);

        return Result.Success(new LoginUserResponse(token, user.Id, user.Email.Value));
    }
}
