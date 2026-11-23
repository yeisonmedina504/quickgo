namespace quickgo.Application.Features.Envios.DTOs;

/// <summary>Datos para asignar un vehículo y un conductor a un envío.</summary>
public sealed record AsignarEnvioRequestDto
{
    public required Guid AsignacionId { get; init; }
    public decimal? CostoExterno { get; init; }
}
