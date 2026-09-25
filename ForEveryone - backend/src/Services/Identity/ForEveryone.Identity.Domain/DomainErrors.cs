using ForEveryone.SharedKernel;

namespace ForEveryone.Identity.Domain;

/// <summary>
/// Catalogo centralizado de errores de dominio del contexto Identity.
/// Mantenerlos en un solo lugar evita strings magicos repetidos en los handlers.
/// </summary>
public static class DomainErrors
{
    public static class Email
    {
        public static readonly Error Empty = new("Email.Empty", "El email no puede estar vacio.");
        public static readonly Error TooLong = new("Email.TooLong", "El email es demasiado largo.");
        public static readonly Error InvalidFormat = new("Email.InvalidFormat", "El formato del email no es valido.");
    }

    public static class Username
    {
        public static readonly Error Empty = new("Username.Empty", "El nombre de usuario no puede estar vacio.");
        public static readonly Error TooShort = new("Username.TooShort", "El nombre de usuario debe tener al menos 3 caracteres.");
        public static readonly Error TooLong = new("Username.TooLong", "El nombre de usuario no puede superar los 24 caracteres.");
        public static readonly Error InvalidCharacters = new("Username.InvalidCharacters", "El nombre de usuario solo admite letras, numeros, punto, guion y guion bajo, y debe empezar y terminar en letra o numero.");
    }

    public static class User
    {
        public static readonly Error EmailAlreadyInUse = new("User.EmailAlreadyInUse", "Ya existe una cuenta con este email.");
        public static readonly Error UsernameAlreadyInUse = new("User.UsernameAlreadyInUse", "Ya existe una cuenta con este nombre de usuario.");
        public static readonly Error NotFound = new("User.NotFound", "El usuario no existe.");
        public static readonly Error InvalidCredentials = new("User.InvalidCredentials", "Email, nombre de usuario o contrasena incorrectos.");
        public static readonly Error InactiveAccount = new("User.InactiveAccount", "La cuenta esta desactivada.");
    }
}
