using ForEveryone.SharedKernel;

namespace ForEveryone.Heroes.Domain;

/// <summary>
/// Regla de negocio incumplida en el agregado Hero. Sustituye a los
/// `InvalidOperationException` con frase en castellano: el controlador traduce la
/// clave y el jugador la lee en su idioma.
/// </summary>
public sealed class HeroRuleException : Exception
{
    public LocalizedText Text { get; }

    public HeroRuleException(LocalizedText text) : base(text.Key) => Text = text;

    public HeroRuleException(string key) : this(LocalizedText.Of(key)) { }

    public HeroRuleException(string key, params (string Name, object Value)[] args)
        : this(LocalizedText.Of(key, args)) { }
}