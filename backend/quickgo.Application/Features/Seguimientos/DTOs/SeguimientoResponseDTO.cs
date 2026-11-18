namespace quickgo.Application.DTOs.Envios;

public record SeguimientoResponseDTO
{
    public required Guid Id { get; init; }
    public required Guid EnvioId { get; init; }
    public decimal? Lat { get; init; }
    public decimal? Lng { get; init; }
    public required string Estado { get; init; }
    public required DateTimeOffset Momento { get; init; }
}