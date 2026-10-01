using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Domain;

/// <summary>
/// Catalogo centralizado de errores de dominio del contexto Identity.
/// Mantenerlos en un solo lugar evita strings magicos repetidos en los handlers.
///
/// <see cref="Error.Code"/> decide el codigo HTTP y <see cref="Error.Description"/>
/// queda solo para el log del servidor. El <c>Details</c> lleva la clave con la
/// que el cliente reconstruye el texto en su idioma.
/// </summary>
public static class DomainErrors
{
    public static class Email
    {
        public static readonly Error Empty = new("Email.Empty", "El email no puede estar vacio.", Key("auth.error.emailEmpty"));
        public static readonly Error TooLong = new("Email.TooLong", "El email es demasiado largo.", Key("auth.error.emailTooLong"));
        public static readonly Error InvalidFormat = new("Email.InvalidFormat", "El formato del email no es valido.", Key("auth.error.emailInvalid"));
    }

    public static class Username
    {
        public static readonly Error Empty = new("Username.Empty", "El nombre de usuario no puede estar vacio.", Key("auth.error.usernameEmpty"));
        public static readonly Error TooShort = new("Username.TooShort", "El nombre de usuario debe tener al menos 3 caracteres.", Key("auth.error.usernameTooShort"));
        public static readonly Error TooLong = new("Username.TooLong", "El nombre de usuario no puede superar los 24 caracteres.", Key("auth.error.usernameTooLong"));
        public static readonly Error InvalidCharacters = new("Username.InvalidCharacters", "El nombre de usuario solo admite letras, numeros, punto, guion y guion bajo, y debe empezar y terminar en letra o numero.", Key("auth.error.usernamePattern"));
    }

    public static class User
    {
        public static readonly Error EmailAlreadyInUse = new("User.EmailAlreadyInUse", "Ya existe una cuenta con este email.", Key("auth.error.emailAlreadyInUse"));
        public static readonly Error UsernameAlreadyInUse = new("User.UsernameAlreadyInUse", "Ya existe una cuenta con este nombre de usuario.", Key("auth.error.usernameAlreadyInUse"));
        public static readonly Error NotFound = new("User.NotFound", "El usuario no existe.", Key("auth.error.userNotFound"));
        public static readonly Error InvalidCredentials = new("User.InvalidCredentials", "Email, nombre de usuario o contrasena incorrectos.", Key("auth.error.invalidCredentials"));
        public static readonly Error InactiveAccount = new("User.InactiveAccount", "La cuenta esta desactivada.", Key("auth.error.accountInactive"));
    }

    /// <summary>
    /// Envoltura minima para dejar claro que el dato es una clave de traduccion
    /// y no un mensaje. Los errores de dominio no llevan argumentos todavia.
    /// </summary>
    private static IReadOnlyDictionary<string, string> Key(string key) =>
        new Dictionary<string, string> { ["key"] = key };
}