namespace quickgo.Application.Features.Cotizaciones.DTOs;

public record CrearCotizacionRequest(
    decimal Monto,
    string MonedaCodigo,
    DateTimeOffset ValidaHasta
);