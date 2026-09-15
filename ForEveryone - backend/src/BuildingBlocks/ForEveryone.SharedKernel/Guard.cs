namespace ForEveryone.SharedKernel;

/// <summary>
/// Guard clauses simples para proteger invariantes dentro del dominio.
/// Se usan para errores de PROGRAMACION (argumentos invalidos), no para
/// reglas de negocio esperadas, que deben modelarse con Result/Error.
/// </summary>
public static class Guard
{
    public static string AgainstNullOrWhiteSpace(string? value, string paramName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"'{paramName}' no puede ser nulo o vacio.", paramName);

        return value;
    }

    public static T AgainstNull<T>(T? value, string paramName) where T : class
    {
        if (value is null)
            throw new ArgumentNullException(paramName);

        return value;
    }

    public static int AgainstNegative(int value, string paramName)
    {
        if (value < 0)
            throw new ArgumentOutOfRangeException(paramName, "El valor no puede ser negativo.");

        return value;
    }
}
