namespace quickgo.Application.Features.Seguimientos.DTOs;

public record RegisterSeguimientoRequestDTO(
    decimal Lat,
    decimal Lng,
    string Estado
);