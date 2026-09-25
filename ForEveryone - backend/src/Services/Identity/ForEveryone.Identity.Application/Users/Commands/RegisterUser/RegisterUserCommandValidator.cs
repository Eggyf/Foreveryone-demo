using FluentValidation;

namespace ForEveryone.Identity.Application.Users.Commands.RegisterUser;

public sealed class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("El nombre de usuario es obligatorio.")
            .MinimumLength(3).WithMessage("El nombre de usuario debe tener al menos 3 caracteres.")
            .MaximumLength(24).WithMessage("El nombre de usuario no puede superar los 24 caracteres.")
            .Matches("^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$")
            .WithMessage("El nombre de usuario solo admite letras, numeros, punto, guion y guion bajo, y debe empezar y terminar en letra o numero.");

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
