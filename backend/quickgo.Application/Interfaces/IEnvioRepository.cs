using quickgo.Application.Features.Envios.DTOs;
using quickgo.Domain.entities;
using quickgo.Domain.Enums;

namespace quickgo.Application.Interfaces;

public interface IEnvioRepository
{
    Task<bool> ClientePerteneceAEmpresaAsync(
        Guid empresaId,
        Guid clienteId,
        CancellationToken cancellationToken = default);
    Task<bool> DireccionesPertenecenAEmpresaAsync(
        Guid empresaId,
        Guid origenId,
        Guid destinoId,
        CancellationToken cancellationToken = default);
    Task<Envio?> ObtenerEntidadAsync(
        Guid empresaId,
        Guid id,
        CancellationToken cancellationToken = default);
    Task<Vehiculo?> ObtenerVehiculoAsync(
        Guid empresaId,
        Guid vehiculoId,
        CancellationToken cancellationToken = default);
    Task<AsignacionVehiculoConductor?> ObtenerAsignacionActivaAsync(
        Guid empresaId,
        Guid asignacionId,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EnvioResponseDto>> ListarAsync(
        Guid empresaId,
        EstadoEnvio? estado,
        DateTimeOffset? desde,
        DateTimeOffset? hasta,
        Guid? conductorId,
        CancellationToken cancellationToken = default);
    Task<EnvioResponseDto?> ObtenerDetalleAsync(
        Guid empresaId,
        Guid id,
        Guid? conductorId,
        CancellationToken cancellationToken = default);
    Task AgregarAsync(Envio envio, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
