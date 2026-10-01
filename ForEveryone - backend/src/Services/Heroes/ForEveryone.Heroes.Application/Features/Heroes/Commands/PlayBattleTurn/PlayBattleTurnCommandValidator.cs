using FluentValidation;
using ForEveryone.Heroes.Domain;

namespace ForEveryone.Heroes.Application.Features.Heroes.Commands.PlayBattleTurn;

/// <summary>
/// Las claves las resuelve el cliente; el pipeline anade el nombre de la
/// propiedad como argumento. Ver `ValidationBehavior`.
/// </summary>
public sealed class PlayBattleTurnCommandValidator : AbstractValidator<PlayBattleTurnCommand>
{
    public PlayBattleTurnCommandValidator()
    {
        RuleFor(x => x.UserId).NotEqual(Guid.Empty).WithMessage("battle.validation.userRequired");
        RuleFor(x => x.BattleId).NotEqual(Guid.Empty).WithMessage("battle.validation.invalidBattle");
        RuleFor(x => x.Action).IsInEnum().WithMessage("battle.validation.invalidAction");
    }
}