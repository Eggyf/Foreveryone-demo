using FluentValidation;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;

public class CreateHeroCommandValidator : AbstractValidator<CreateHeroCommand>
{
    public CreateHeroCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Class).IsInEnum().WithMessage("La clase de héroe no es válida.");
    }
}