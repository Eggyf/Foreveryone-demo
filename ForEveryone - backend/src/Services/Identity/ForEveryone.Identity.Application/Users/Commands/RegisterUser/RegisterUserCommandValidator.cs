using FluentValidation;

namespace ForEveryone.Identity.Application.Users.Commands.RegisterUser;

public sealed class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        // Las reglas de formato (longitudes minimas, patrones) viven en el
        // dominio, en `Username` y `Password`. Aqui solo se confirma que el
        // valor llego y se traduce el motivo, que el cliente compone en su idioma.
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("auth.validation.usernameRequired")
            .MinimumLength(3).WithMessage("auth.validation.usernameTooShort")
            .MaximumLength(24).WithMessage("auth.validation.usernameTooLong")
            .Matches("^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$")
            .WithMessage("auth.validation.usernamePattern");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("auth.validation.emailRequired")
            .EmailAddress().WithMessage("auth.validation.emailInvalid");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("auth.validation.passwordRequired")
            .MinimumLength(8).WithMessage("auth.validation.passwordTooShort")
            .Matches("[A-Z]").WithMessage("auth.validation.passwordNeedsUppercase")
            .Matches("[0-9]").WithMessage("auth.validation.passwordNeedsDigit");
    }
}
