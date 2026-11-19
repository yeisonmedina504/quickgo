using quickgo.Domain.Enums;

namespace quickgo.Application.Features.Envios.DTOs;

/// <summary>Datos necesarios para programar un envío.</summary>
public sealed record CrearEnvioRequestDto
{
    public required Guid ClienteId { get; init; }
    public required Guid OrigenDireccionId { get; init; }
    public required Guid DestinoDireccionId { get; init; }
    public required TipoServicio TipoServicio { get; init; }
    public required decimal PesoKg { get; init; }
    public decimal? VolumenM3 { get; init; }
    public required DateTimeOffset FechaProgramada { get; init; }
    public required decimal Tarifa { get; init; }
}
