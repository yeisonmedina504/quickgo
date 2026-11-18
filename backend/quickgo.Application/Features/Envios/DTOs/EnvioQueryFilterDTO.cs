namespace quickgo.Application.Features.Envios.DTOs;
public record EnvioFiltroQueryDTO(
    string? Estado = null,
    DateTimeOffset? FechaDesde = null,
    DateTimeOffset? FechaHasta = null
);