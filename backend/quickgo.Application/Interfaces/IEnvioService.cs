using quickgo.Application.Common;
using quickgo.Application.Features.Envios.DTOs;

namespace quickgo.Application.Interfaces;

public interface IEnvioService
{
    Task<IReadOnlyList<EnvioResponseDto>> ListarAsync(
        Guid empresaId,
        EnvioFiltroRequestDto filtro,
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
    Task<Resultado<EnvioResponseDto>> AsignarAsync(
        Guid empresaId,
        Guid id,
        AsignarEnvioRequestDto request,
        CancellationToken cancellationToken = default);
}
