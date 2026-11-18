namespace quickgo.Application.Features.Cotizaciones.DTOs;

public record CotizacionesResponseDTO(
    Guid Id,
    Guid EnvioId,
    decimal Monto,
    string MonedaCodigo,
    DateTimeOffset ValidaHasta,
    bool Aceptada
);