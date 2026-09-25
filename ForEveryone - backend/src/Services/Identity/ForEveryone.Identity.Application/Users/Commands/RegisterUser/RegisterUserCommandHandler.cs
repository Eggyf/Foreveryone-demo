using ForEveryone.Identity.Application.Common.Interfaces;
using ForEveryone.Identity.Domain;
using ForEveryone.Identity.Domain.Entities;
using ForEveryone.Identity.Domain.Repositories;
using ForEveryone.Identity.Domain.ValueObjects;
using ForEveryone.SharedKernel;
using MediatR;

namespace ForEveryone.Identity.Application.Users.Commands.RegisterUser;

public sealed class RegisterUserCommandHandler
    : IRequestHandler<RegisterUserCommand, Result<RegisterUserResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<RegisterUserResponse>> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken)
    {
        var usernameResult = Username.Create(request.Username);
        if (usernameResult.IsFailure)
            return Result.Failure<RegisterUserResponse>(usernameResult.Error);

        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
            return Result.Failure<RegisterUserResponse>(emailResult.Error);

        var username = usernameResult.Value;
        var email = emailResult.Value;

        if (await _userRepository.ExistsByUsernameAsync(username, cancellationToken))
            return Result.Failure<RegisterUserResponse>(DomainErrors.User.UsernameAlreadyInUse);

        if (await _userRepository.ExistsByEmailAsync(email, cancellationToken))
            return Result.Failure<RegisterUserResponse>(DomainErrors.User.EmailAlreadyInUse);

        var passwordHash = _passwordHasher.Hash(request.Password);

        var userResult = User.Register(username, email, passwordHash);
        if (userResult.IsFailure)
            return Result.Failure<RegisterUserResponse>(userResult.Error);

        var user = userResult.Value;
        _userRepository.Add(user);

        // El SaveChanges lo dispara el UnitOfWorkBehavior automaticamente si esto es exitoso.
        return Result.Success(new RegisterUserResponse(user.Id, user.Username.Value, user.Email.Value));
    }
}
