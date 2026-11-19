namespace quickgo.Application.Features.Envios.DTOs;

/// <summary>Información básica del cliente asociado a un envío.</summary>
public sealed record EnvioClienteResponseDto(
    Guid Id,
    string PrimerNombre,
    string? SegundoNombre,
    string PrimerApellido,
    string? SegundoApellido,
    string Telefono,
    string? Email);
