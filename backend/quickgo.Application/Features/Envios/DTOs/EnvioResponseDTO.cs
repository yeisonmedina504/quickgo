using quickgo.Domain.enums;

namespace quickgo.Application.Features.Envios.DTOs;

public record EnvioResponseDTO(
    Guid Id,
    Guid ClienteId,
    string ClienteNombre,
    Guid? SubastaId,
    Guid OrigenDireccionId,
    Guid DestinoDireccionId,
    Guid? VehiculoId,
    Guid? ConductorId,
    string TipoServicio,
    // EstadoEnvio Estado,
    decimal? PesoKg,
    decimal? VolumenM3,
    DateTimeOffset FechaProgramada,
    decimal Tarifa,
    decimal CostoExterno,
    decimal Margen
);