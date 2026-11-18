namespace quickgo.Application.Features.Envios.DTOs;

public record AssignEnvioRequestDTO
{
    Guid VehiculoId;
    Guid ConductorID;
    decimal? CostoExterno;
}