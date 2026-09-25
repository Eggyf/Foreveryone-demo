using FluentValidation;

namespace ForEveryone.Identity.Application.Users.Commands.LoginUser;

public sealed class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserCommandValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty().WithMessage("El email o nombre de usuario es obligatorio.")
            .MaximumLength(256).WithMessage("El email o nombre de usuario es demasiado largo.");

        RuleFor(x => x.Password).NotEmpty().WithMessage("La contrasena es obligatoria.");
    }
}
