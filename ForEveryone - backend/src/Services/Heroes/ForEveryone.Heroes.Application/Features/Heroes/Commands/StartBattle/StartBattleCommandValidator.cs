using FluentValidation;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;

public class StartBattleCommandValidator : AbstractValidator<StartBattleCommand>
{
    public StartBattleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEqual(Guid.Empty).WithMessage("El identificador de usuario es obligatorio.");
        RuleFor(x => x.EnemyKey).NotEmpty().WithMessage("Debes indicar contra qué enemigo luchas.");
    }
}
