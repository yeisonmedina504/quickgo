using quickgo.Application.Common;
using quickgo.Application.Features.Envios.DTOs;

namespace quickgo.Application.Interfaces;

public interface IEnvioService
{
    Task<IReadOnlyList<EnvioResponseDto>> ListarAsync(
        Guid empresaId,
        EnvioFiltroDto filtro,
        Guid? conductorId,
        CancellationToken cancellationToken = default);
    Task<Resultado<EnvioResponseDto>> ObtenerAsync(
        Guid empresaId,
        Guid id,
        Guid? conductorId,
        CancellationToken cancellationToken = default);
    Task<Resultado<EnvioResponseDto>> CrearAsync(
        Guid empresaId,
        CrearEnvioRequestDto request,
        CancellationToken cancellationToken = default);
    Task<Resultado<EnvioResponseDto>> ActualizarAsync(
        Guid empresaId,
        Guid id,
        ActualizarEnvioRequestDto request,
        CancellationToken cancellationToken = default);
    Task<Resultado<EnvioResponseDto>> CancelarAsync(
        Guid empresaId,
        Guid id,
        CancellationToken cancellationToken = default);
}
