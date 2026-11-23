using quickgo.Application.Common;
using quickgo.Application.Features.Envios.DTOs;
using quickgo.Application.Interfaces;
using quickgo.Domain.entities;
using quickgo.Domain.enums;
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
        EnvioFiltroRequestDto filtro,
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

        if (envio.Estado == EstadoEnvio.Asignado && envio.VehiculoId.HasValue)
        {
            var vehiculo = await _repository.ObtenerVehiculoAsync(
                empresaId, envio.VehiculoId.Value, cancellationToken);
            if (vehiculo?.Estado == EstadoVehiculo.EnServicio)
            {
                vehiculo.Estado = EstadoVehiculo.Disponible;
            }
        }

        envio.Estado = EstadoEnvio.Cancelado;
        await _repository.GuardarCambiosAsync(cancellationToken);
        return await ObtenerResultadoGuardadoAsync(empresaId, envio.Id, cancellationToken);
    }

    public async Task<Resultado<EnvioResponseDto>> AsignarAsync(
        Guid empresaId,
        Guid id,
        AsignarEnvioRequestDto request,
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
                "Envío no asignable",
                "Solo se puede asignar un envío en estado Pendiente.");
        }

        var asignacion = await _repository.ObtenerAsignacionActivaAsync(
            empresaId, request.AsignacionId, cancellationToken);
        if (asignacion is null)
        {
            return Resultado<EnvioResponseDto>.NoEncontrado(
                "Asignación no encontrada",
                "La asignación no existe en tu empresa o ya fue finalizada.");
        }

        var vehiculo = asignacion.Vehiculo;
        if (vehiculo.Estado != EstadoVehiculo.Disponible)
        {
            return Resultado<EnvioResponseDto>.Conflicto(
                "Vehículo no disponible",
                "El vehículo debe estar Disponible para asignarlo.");
        }

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        if (!vehiculo.Documentos.Any(documento =>
                documento.Tipo == TipoDocumento.Seguro &&
                documento.FechaVencimiento >= hoy))
        {
            return Resultado<EnvioResponseDto>.Conflicto(
                "Seguro no vigente",
                "El vehículo debe tener un seguro vigente para asignarlo.");
        }

        var conductor = asignacion.Conductor;
        if (conductor.Estado != EstadoConductor.Activo)
        {
            return Resultado<EnvioResponseDto>.Conflicto(
                "Conductor inactivo",
                "El conductor debe estar Activo para asignarlo.");
        }

        envio.VehiculoId = vehiculo.VehiculoId;
        envio.ConductorId = asignacion.ConductorId;
        envio.CostoExterno = request.CostoExterno ?? envio.CostoExterno;
        envio.Estado = EstadoEnvio.Asignado;
        vehiculo.Estado = EstadoVehiculo.EnServicio;

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
