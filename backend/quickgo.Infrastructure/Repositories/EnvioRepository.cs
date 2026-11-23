using Microsoft.EntityFrameworkCore;
using quickgo.Application.Features.Envios.DTOs;
using quickgo.Application.Interfaces;
using quickgo.Domain.entities;
using quickgo.Domain.Enums;
using quickgo.Infrastructure.Data;

namespace quickgo.Infrastructure.Repositories;

public sealed class EnvioRepository : IEnvioRepository
{
    private readonly QuickGoDbContext _context;

    public EnvioRepository(QuickGoDbContext context)
    {
        _context = context;
    }

    public Task<bool> ClientePerteneceAEmpresaAsync(
        Guid empresaId,
        Guid clienteId,
        CancellationToken cancellationToken = default) =>
        _context.Clientes.AnyAsync(
            cliente => cliente.Id == clienteId && cliente.EmpresaId == empresaId,
            cancellationToken);

    public async Task<bool> DireccionesPertenecenAEmpresaAsync(
        Guid empresaId,
        Guid origenId,
        Guid destinoId,
        CancellationToken cancellationToken = default)
    {
        var ids = new[] { origenId, destinoId };
        var cantidad = await _context.Direcciones
            .CountAsync(direccion => direccion.EmpresaId == empresaId && ids.Contains(direccion.Id),
                cancellationToken);
        return cantidad == 2;
    }

    public Task<Envio?> ObtenerEntidadAsync(
        Guid empresaId,
        Guid id,
        CancellationToken cancellationToken = default) =>
        _context.Envios.FirstOrDefaultAsync(
            envio => envio.EmpresaId == empresaId && envio.Id == id,
            cancellationToken);

    public async Task<IReadOnlyList<EnvioResponseDto>> ListarAsync(
        Guid empresaId,
        EstadoEnvio? estado,
        DateTimeOffset? desde,
        DateTimeOffset? hasta,
        Guid? conductorId,
        CancellationToken cancellationToken = default) =>
        await ConsultarDetalles(empresaId, conductorId, estado, desde, hasta)
            .ToListAsync(cancellationToken);

    public Task<EnvioResponseDto?> ObtenerDetalleAsync(
        Guid empresaId,
        Guid id,
        Guid? conductorId,
        CancellationToken cancellationToken = default)
    {
        return ConsultarDetalles(empresaId, conductorId, envioId: id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AgregarAsync(Envio envio, CancellationToken cancellationToken = default)
    {
        await _context.Envios.AddAsync(envio, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default) =>
        await _context.SaveChangesAsync(cancellationToken);

    private IQueryable<EnvioResponseDto> ConsultarDetalles(
        Guid empresaId,
        Guid? conductorId,
        EstadoEnvio? estado = null,
        DateTimeOffset? desde = null,
        DateTimeOffset? hasta = null,
        Guid? envioId = null) =>
        from envio in _context.Envios.AsNoTracking()
        join cliente in _context.Clientes.AsNoTracking() on envio.ClienteId equals cliente.Id
        join origen in _context.Direcciones.AsNoTracking() on envio.OrigenDireccionId equals origen.Id
        join ciudadOrigen in _context.Ciudades.AsNoTracking() on origen.CiudadId equals ciudadOrigen.Id
        join destino in _context.Direcciones.AsNoTracking() on envio.DestinoDireccionId equals destino.Id
        join ciudadDestino in _context.Ciudades.AsNoTracking() on destino.CiudadId equals ciudadDestino.Id
        where envio.EmpresaId == empresaId
              && cliente.EmpresaId == empresaId
              && origen.EmpresaId == empresaId
              && destino.EmpresaId == empresaId
              && (!envioId.HasValue || envio.Id == envioId.Value)
              && (!estado.HasValue || envio.Estado == estado.Value)
              && (!desde.HasValue || envio.FechaProgramada >= desde.Value)
              && (!hasta.HasValue || envio.FechaProgramada <= hasta.Value)
              && (!conductorId.HasValue || envio.ConductorId == conductorId.Value)
        orderby envio.FechaProgramada, envio.Id
        select new EnvioResponseDto(
            envio.Id,
            envio.ClienteId,
            new EnvioClienteResponseDto(
                cliente.Id,
                cliente.PrimerNombre,
                cliente.SegundoNombre,
                cliente.PrimerApellido,
                cliente.SegundoApellido,
                cliente.Telefono,
                cliente.Email),
            envio.OrigenDireccionId,
            new EnvioDireccionResponseDto(
                origen.Id,
                origen.CiudadId,
                ciudadOrigen.Nombre,
                origen.CallePrincipal,
                origen.NumeroExterior,
                origen.ColoniaSector,
                origen.Referencia,
                origen.Lat,
                origen.Lng),
            envio.DestinoDireccionId,
            new EnvioDireccionResponseDto(
                destino.Id,
                destino.CiudadId,
                ciudadDestino.Nombre,
                destino.CallePrincipal,
                destino.NumeroExterior,
                destino.ColoniaSector,
                destino.Referencia,
                destino.Lat,
                destino.Lng),
            envio.TipoServicio,
            envio.Estado,
            envio.PesoKg,
            envio.VolumenM3,
            envio.FechaProgramada,
            envio.Tarifa,
            envio.CostoExterno,
            envio.Tarifa - envio.CostoExterno);
}
