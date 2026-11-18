
namespace quickgo.Application.Features.Envios.DTOs;

public record CreateEnvioRequestDTO(
    Guid ClienteId,
    Guid OrigenDireccionId,
    Guid DestinoDireccionId,
    string TipoServicio,
    DateTimeOffset FechaProgramada,
    decimal PesoKg,
    decimal? VolumenM3,
    decimal Tarifa
);