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

    public static class User
    {
        public static readonly Error EmailAlreadyInUse = new("User.EmailAlreadyInUse", "Ya existe una cuenta con este email.");
        public static readonly Error NotFound = new("User.NotFound", "El usuario no existe.");
        public static readonly Error InvalidCredentials = new("User.InvalidCredentials", "Email o contrasena incorrectos.");
        public static readonly Error InactiveAccount = new("User.InactiveAccount", "La cuenta esta desactivada.");
    }
}
