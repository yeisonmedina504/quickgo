namespace quickgo.Application.Common;

/// <summary>Resultado de una operacion de aplicacion, para devolver errores sin tirar excepciones.</summary>
public enum TipoError {
    Ninguno = 0,
    Validacion = 1,
    NoAutenticado = 2,
    Prohibido = 3,
    NoEncontrado = 4,
    Conflicto = 5
}

public class Resultado<T> {
    public bool Exito { get; }
    public T? Valor { get; }
    public TipoError Error { get; }
    public string Titulo { get; }
    public string Detalle { get; }
    public IDictionary<string, string[]>? Errores { get; }

    private Resultado(bool exito, T? valor, TipoError error, string titulo, string detalle,
        IDictionary<string, string[]>? errores) {
        Exito = exito;
        Valor = valor;
        Error = error;
        Titulo = titulo;
        Detalle = detalle;
        Errores = errores;
    }

    public static Resultado<T> Ok(T valor) => new(true, valor, TipoError.Ninguno, "", "", null);
    public static Resultado<T> Validacion(string detalle, IDictionary<string, string[]>? errores = null) =>
        new(false, default, TipoError.Validacion, "Datos invalidos", detalle, errores);
    // Alias de compatibilidad: varios servicios usan Invalido(titulo, detalle).
    public static Resultado<T> Invalido(string titulo, string detalle, IDictionary<string, string[]>? errores = null) =>
        new(false, default, TipoError.Validacion, titulo, detalle, errores);
    public static Resultado<T> NoAutenticado(string titulo, string detalle) =>
        new(false, default, TipoError.NoAutenticado, titulo, detalle, null);
    public static Resultado<T> Prohibido(string titulo, string detalle) =>
        new(false, default, TipoError.Prohibido, titulo, detalle, null);
    public static Resultado<T> NoEncontrado(string titulo, string detalle) =>
        new(false, default, TipoError.NoEncontrado, titulo, detalle, null);
    public static Resultado<T> Conflicto(string titulo, string detalle) =>
        new(false, default, TipoError.Conflicto, titulo, detalle, null);

    /// <summary>Lanza FluentValidation.ValidationException para que el middleware global la convierta en ProblemDetails 400.</summary>
    public void LanzarSiFalla() {
        if (Exito) return;
        if (Error == TipoError.Validacion) {
            var failures = (Errores ?? new Dictionary<string, string[]> { [""] = [Detalle] })
                .SelectMany(kv => kv.Value.Select(msg => new FluentValidation.Results.ValidationFailure(kv.Key, msg)));
            throw new FluentValidation.ValidationException(failures);
        }
        throw new InvalidOperationException($"{Titulo}: {Detalle}");
    }
}
