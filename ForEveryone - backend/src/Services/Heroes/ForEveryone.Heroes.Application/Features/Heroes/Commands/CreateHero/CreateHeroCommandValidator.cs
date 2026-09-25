using FluentValidation;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;

public class CreateHeroCommandValidator : AbstractValidator<CreateHeroCommand>
{
    public CreateHeroCommandValidator()
    {
        // NotEmpty no basta: Guid.Empty es un valor valido para el tipo pero
        // identifica a ningun usuario, y el mensaje por defecto en ingles
        // confunde. Se valida como "no vacio" de forma explicita.
        RuleFor(x => x.UserId)
            .NotEqual(Guid.Empty).WithMessage("El identificador de usuario es obligatorio.");

        RuleFor(x => x.Race).IsInEnum().WithMessage("La raza no es válida.");
        RuleFor(x => x.Class).IsInEnum().WithMessage("La clase de héroe no es válida.");
    }
}
