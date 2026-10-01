using FluentValidation;

namespace ForEveryone.Identity.Application.Users.Commands.LoginUser;

/// <summary>
/// Las reglas de formato viven en el dominio; aqui solo se confirma que el
/// valor llego. El motivo va como clave de traduccion para que el cliente lo
/// componga en su idioma.
/// </summary>
public sealed class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserCommandValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty().WithMessage("auth.validation.identifierRequired")
            .MaximumLength(256).WithMessage("auth.validation.identifierTooLong");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("auth.validation.passwordRequired");
    }
}