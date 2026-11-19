namespace quickgo.Application.Features.Envios.DTOs;

/// <summary>Dirección de origen o destino incluida en la respuesta del envío.</summary>
public sealed record EnvioDireccionResponseDto(
    Guid Id,
    Guid CiudadId,
    string CiudadNombre,
    string CallePrincipal,
    string? NumeroExterior,
    string? ColoniaSector,
    string? Referencia,
    decimal Lat,
    decimal Lng);
