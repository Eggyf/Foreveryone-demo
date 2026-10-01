using FluentValidation;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;

/// <summary>
/// Los mensajes son claves de traduccion, no frases: el pipeline las envuelve en
/// un `LocalizedText` con el nombre de la propiedad como argumento, y el cliente
/// las resuelve en el idioma del jugador.
/// </summary>
public sealed class CreateHeroCommandValidator : AbstractValidator<CreateHeroCommand>
{
    public CreateHeroCommandValidator()
    {
        RuleFor(x => x.Race).IsInEnum().WithMessage("hero.validation.invalidRace");
        RuleFor(x => x.Class).IsInEnum().WithMessage("hero.validation.invalidClass");
    }
}