
using quickgo.Domain.enums;

namespace quickgo.Application.DTOs.Envios;

public record EnvioDetalleResponseDTO(
    Guid Id,
    Guid ClienteId,
    string ClienteNombre,
    Guid? SubastaId,
    Guid OrigenDireccionId,
    Guid DestinoDireccionId,
    Guid? VehiculoId,
    Guid? ConductorId,
    string TipoServicio,
    string Estado,
    decimal? PesoKg,
    decimal? VolumenM3,
    DateTimeOffset FechaProgramada,
    decimal Tarifa,
    decimal CostoExterno,
    decimal Margen,
    // DireccionResumenResponse Origen,
    // DireccionResumenResponse Destino,
    string? VehiculoPlaca,
    string? ConductorNombre
);