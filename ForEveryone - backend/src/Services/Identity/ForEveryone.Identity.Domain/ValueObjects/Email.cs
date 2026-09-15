using System.Text.RegularExpressions;
using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Domain.ValueObjects;

/// <summary>
/// Value Object que garantiza que nunca exista un Email invalido dentro del dominio.
/// La unica forma de crear uno es via el factory Create, que devuelve un Result.
/// </summary>
public sealed partial class Email : ValueObject
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Email>(DomainErrors.Email.Empty);

        email = email.Trim();

        if (email.Length > 256)
            return Result.Failure<Email>(DomainErrors.Email.TooLong);

        if (!EmailRegex().IsMatch(email))
            return Result.Failure<Email>(DomainErrors.Email.InvalidFormat);

        return Result.Success(new Email(email.ToLowerInvariant()));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailRegex();
}
