using quickgo.Domain.Enums;

namespace quickgo.Application.Features.Envios.DTOs;

/// <summary>Filtros opcionales para consultar envíos.</summary>
public sealed record EnvioFiltroDto
{
    public EstadoEnvio? Estado { get; init; }
    public DateTimeOffset? Desde { get; init; }
    public DateTimeOffset? Hasta { get; init; }
}
