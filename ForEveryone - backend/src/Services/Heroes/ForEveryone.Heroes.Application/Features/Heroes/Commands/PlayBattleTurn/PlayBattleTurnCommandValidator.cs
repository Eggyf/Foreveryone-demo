using FluentValidation;
using ForEveryone.Heroes.Domain;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.PlayBattleTurn;

public class PlayBattleTurnCommandValidator : AbstractValidator<PlayBattleTurnCommand>
{
    public PlayBattleTurnCommandValidator()
    {
        RuleFor(x => x.UserId).NotEqual(Guid.Empty).WithMessage("El identificador de usuario es obligatorio.");
        RuleFor(x => x.BattleId).NotEqual(Guid.Empty).WithMessage("El combate no es válido.");
        RuleFor(x => x.Action).IsInEnum().WithMessage("La acción no es válida.");
    }
}
