using quickgo.Domain.Enums;

namespace quickgo.Application.Features.Envios.DTOs;

/// <summary>Envío con cliente, direcciones y margen calculado.</summary>
public sealed record EnvioResponseDto(
    Guid Id,
    Guid ClienteId,
    EnvioClienteResponseDto Cliente,
    Guid OrigenDireccionId,
    EnvioDireccionResponseDto Origen,
    Guid DestinoDireccionId,
    EnvioDireccionResponseDto Destino,
    TipoServicio? TipoServicio,
    EstadoEnvio Estado,
    decimal? PesoKg,
    decimal? VolumenM3,
    DateTimeOffset FechaProgramada,
    decimal Tarifa,
    decimal CostoExterno,
    decimal Margen);
