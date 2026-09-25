using System.Text.RegularExpressions;
using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Domain.ValueObjects;

/// <summary>
/// Value Object que garantiza que nunca exista un nombre de usuario invalido
/// dentro del dominio. Se normaliza a minusculas para que "Ainz" y "ainz"
/// sean siempre la misma cuenta. La unica forma de crear uno es el
/// factory Create, que devuelve un Result.
/// </summary>
public sealed partial class Username : ValueObject
{
    public const int MinLength = 3;
    public const int MaxLength = 24;

    public string Value { get; }

    private Username(string value) => Value = value;

    public static Result<Username> Create(string? username)
    {
        if (string.IsNullOrWhiteSpace(username))
            return Result.Failure<Username>(DomainErrors.Username.Empty);

        username = username.Trim();

        if (username.Length < MinLength)
            return Result.Failure<Username>(DomainErrors.Username.TooShort);

        if (username.Length > MaxLength)
            return Result.Failure<Username>(DomainErrors.Username.TooLong);

        // Debe empezar y terminar en alfanumerico; en medio admite punto, guion y guion bajo.
        if (!UsernameRegex().IsMatch(username))
            return Result.Failure<Username>(DomainErrors.Username.InvalidCharacters);

        return Result.Success(new Username(username.ToLowerInvariant()));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    [GeneratedRegex(@"^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$")]
    private static partial Regex UsernameRegex();
}
