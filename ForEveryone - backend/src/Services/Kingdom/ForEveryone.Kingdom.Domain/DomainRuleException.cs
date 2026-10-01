using ForEveryone.SharedKernel;

namespace ForEveryone.Kingdom.Domain;

/// <summary>
/// Regla de negocio incumplida. Sustituye a los <c>InvalidOperationException</c>
/// que lanzaba el dominio: la excepcion dice qué regla se incumplio mediante una
/// clave, y el controlador la traduce a un 400 que el cliente sabe pintar.
/// </summary>
public sealed class DomainRuleException : Exception
{
    public LocalizedText Text { get; }

    public DomainRuleException(LocalizedText text) : base(text.Key) => Text = text;

    public DomainRuleException(string key) : this(LocalizedText.Of(key)) { }

    public DomainRuleException(LocalizedText text, params (string Name, object Value)[] args)
        : this(new LocalizedText(text.Key, Merge(text.Args, args))) { }

    /// <summary>Atajo para el caso habitual: clave y argumentos de una vez.</summary>
    public DomainRuleException(string key, params (string Name, object Value)[] args)
        : this(LocalizedText.Of(key, args)) { }

    private static IReadOnlyDictionary<string, string> Merge(
        IReadOnlyDictionary<string, string> existing,
        (string Name, object Value)[] extra)
    {
        var merged = existing.ToDictionary(pair => pair.Key, pair => pair.Value);

        foreach (var (name, value) in extra)
        {
            merged[name] = value is int number
                ? number.ToString(System.Globalization.CultureInfo.InvariantCulture)
                : value.ToString() ?? string.Empty;
        }

        return merged;
    }
}