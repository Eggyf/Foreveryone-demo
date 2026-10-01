using FluentValidation;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.StartBattle;

/// <summary>
/// Las claves las resuelve el cliente; el pipeline anade el nombre de la
/// propiedad como argumento. Ver `ValidationBehavior`.
/// </summary>
public sealed class StartBattleCommandValidator : AbstractValidator<StartBattleCommand>
{
    public StartBattleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEqual(Guid.Empty).WithMessage("battle.validation.userRequired");
        RuleFor(x => x.EnemyKey).NotEmpty().WithMessage("battle.validation.enemyRequired");
    }
}