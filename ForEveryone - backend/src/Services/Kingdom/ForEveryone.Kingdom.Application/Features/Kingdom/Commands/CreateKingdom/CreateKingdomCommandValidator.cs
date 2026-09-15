using FluentValidation;

namespace ForEveryone.Kingdom.Application.Features.Kingdom.Commands.CreateKingdom;

public class CreateKingdomCommandValidator : AbstractValidator<CreateKingdomCommand>
{
    public CreateKingdomCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
    }
}