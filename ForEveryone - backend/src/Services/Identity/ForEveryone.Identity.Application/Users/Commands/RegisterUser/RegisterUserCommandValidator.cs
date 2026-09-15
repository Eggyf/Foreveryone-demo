using FluentValidation;

namespace ForEveryone.Identity.Application.Users.Commands.RegisterUser;

public sealed class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es obligatorio.")
            .EmailAddress().WithMessage("El formato del email no es valido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contrasena es obligatoria.")
            .MinimumLength(8).WithMessage("La contrasena debe tener al menos 8 caracteres.")
            .Matches("[A-Z]").WithMessage("La contrasena debe tener al menos una mayuscula.")
            .Matches("[0-9]").WithMessage("La contrasena debe tener al menos un numero.");
    }
}
