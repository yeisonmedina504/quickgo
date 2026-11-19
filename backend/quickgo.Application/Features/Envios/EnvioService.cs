using quickgo.Application.Common;
using quickgo.Application.Features.Envios.DTOs;
using quickgo.Application.Interfaces;
using quickgo.Domain.entities;
using quickgo.Domain.Enums;

namespace quickgo.Application.Features.Envios;

public sealed class EnvioService : IEnvioService
{
    private readonly IEnvioRepository _repository;

    public EnvioService(IEnvioRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<EnvioResponseDto>> ListarAsync(
        Guid empresaId,
        EnvioFiltroDto filtro,
        Guid? conductorId,
        CancellationToken cancellationToken = default) =>
        _repository.ListarAsync(
            empresaId,
            filtro.Estado,
            filtro.Desde,
            filtro.Hasta,
            conductorId,
            cancellationToken);

    public async Task<Resultado<EnvioResponseDto>> ObtenerAsync(
        Guid empresaId,
        Guid id,
        Guid? conductorId,
        CancellationToken cancellationToken = default)
    {
        var envio = await _repository.ObtenerDetalleAsync(empresaId, id, conductorId, cancellationToken);
        return envio is null
            ? NoExiste()
            : Resultado<EnvioResponseDto>.Ok(envio);
    }

    public async Task<Resultado<EnvioResponseDto>> CrearAsync(
        Guid empresaId,
        CrearEnvioRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var errorReferencias = await ValidarReferenciasAsync(
            empresaId,
            request.ClienteId,
            request.OrigenDireccionId,
            request.DestinoDireccionId,
            cancellationToken);
        if (errorReferencias is not null)
        {
            return errorReferencias;
        }

        var envio = new Envio
        {
            Id = Guid.NewGuid(),
            EmpresaId = empresaId,
            ClienteId = request.ClienteId,
            OrigenDireccionId = request.OrigenDireccionId,
            DestinoDireccionId = request.DestinoDireccionId,
            TipoServicio = request.TipoServicio,
            PesoKg = request.PesoKg,
            VolumenM3 = request.VolumenM3,
            FechaProgramada = request.FechaProgramada,
            Tarifa = request.Tarifa,
            Estado = EstadoEnvio.Pendiente,
            CostoExterno = 0
        };

        await _repository.AgregarAsync(envio, cancellationToken);
        return await ObtenerResultadoGuardadoAsync(empresaId, envio.Id, cancellationToken);
    }

    public async Task<Resultado<EnvioResponseDto>> ActualizarAsync(
        Guid empresaId,
        Guid id,
        ActualizarEnvioRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var envio = await _repository.ObtenerEntidadAsync(empresaId, id, cancellationToken);
        if (envio is null)
        {
            return NoExiste();
        }

        if (envio.Estado != EstadoEnvio.Pendiente)
        {
            return Resultado<EnvioResponseDto>.Conflicto(
                "Envío no editable",
                "Solo se puede editar un envío en estado Pendiente.");
        }

        var errorReferencias = await ValidarReferenciasAsync(
            empresaId,
            request.ClienteId,
            request.OrigenDireccionId,
            request.DestinoDireccionId,
            cancellationToken);
        if (errorReferencias is not null)
        {
            return errorReferencias;
        }

        envio.ClienteId = request.ClienteId;
        envio.OrigenDireccionId = request.OrigenDireccionId;
        envio.DestinoDireccionId = request.DestinoDireccionId;
        envio.TipoServicio = request.TipoServicio;
        envio.PesoKg = request.PesoKg;
        envio.VolumenM3 = request.VolumenM3;
        envio.FechaProgramada = request.FechaProgramada;
        envio.Tarifa = request.Tarifa;

        await _repository.GuardarCambiosAsync(cancellationToken);
        return await ObtenerResultadoGuardadoAsync(empresaId, envio.Id, cancellationToken);
    }

    public async Task<Resultado<EnvioResponseDto>> CancelarAsync(
        Guid empresaId,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var envio = await _repository.ObtenerEntidadAsync(empresaId, id, cancellationToken);
        if (envio is null)
        {
            return NoExiste();
        }

        if (envio.Estado is not (EstadoEnvio.Pendiente or EstadoEnvio.Asignado))
        {
            return Resultado<EnvioResponseDto>.Conflicto(
                "Envío no cancelable",
                "Solo se puede cancelar un envío en estado Pendiente o Asignado.");
        }

        envio.Estado = EstadoEnvio.Cancelado;
        await _repository.GuardarCambiosAsync(cancellationToken);
        return await ObtenerResultadoGuardadoAsync(empresaId, envio.Id, cancellationToken);
    }

    private async Task<Resultado<EnvioResponseDto>?> ValidarReferenciasAsync(
        Guid empresaId,
        Guid clienteId,
        Guid origenId,
        Guid destinoId,
        CancellationToken cancellationToken)
    {
        if (!await _repository.ClientePerteneceAEmpresaAsync(empresaId, clienteId, cancellationToken))
        {
            return Resultado<EnvioResponseDto>.Invalido(
                nameof(CrearEnvioRequestDto.ClienteId),
                "El cliente debe pertenecer a tu empresa.");
        }

        if (!await _repository.DireccionesPertenecenAEmpresaAsync(
                empresaId, origenId, destinoId, cancellationToken))
        {
            return Resultado<EnvioResponseDto>.Invalido(
                "Direcciones",
                "El origen y el destino deben pertenecer a tu empresa.");
        }

        return null;
    }

    private async Task<Resultado<EnvioResponseDto>> ObtenerResultadoGuardadoAsync(
        Guid empresaId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var detalle = await _repository.ObtenerDetalleAsync(empresaId, id, null, cancellationToken);
        return detalle is null
            ? throw new InvalidOperationException("El envío guardado no pudo volver a consultarse.")
            : Resultado<EnvioResponseDto>.Ok(detalle);
    }

    private static Resultado<EnvioResponseDto> NoExiste() =>
        Resultado<EnvioResponseDto>.NoEncontrado("Envío no encontrado", "El envío no existe.");
}
