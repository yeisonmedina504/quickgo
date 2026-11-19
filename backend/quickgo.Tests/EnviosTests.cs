using quickgo.Application.Common;
using quickgo.Application.Features.Envios;
using quickgo.Application.Features.Envios.DTOs;
using quickgo.Domain.entities;
using quickgo.Domain.Enums;
using quickgo.Infrastructure.Data;
using quickgo.Infrastructure.Repositories;

namespace quickgo.Tests;

public class EnviosTests
{
    [Fact]
    public async Task Crear_IniciaPendienteConCostoCero_YDevuelveDetalleYMargen()
    {
        var fixture = await CrearFixtureAsync();

        var resultado = await fixture.Service.CrearAsync(
            Entorno.EmpresaA,
            Request(fixture, tarifa: 250m));

        Assert.True(resultado.Exito);
        Assert.Equal(EstadoEnvio.Pendiente, resultado.Valor!.Estado);
        Assert.Equal(0m, resultado.Valor.CostoExterno);
        Assert.Equal(250m, resultado.Valor.Margen);
        Assert.Equal("Cliente", resultado.Valor.Cliente.PrimerNombre);
        Assert.Equal("Ciudad", resultado.Valor.Origen.CiudadNombre);
        Assert.NotEqual(resultado.Valor.Origen.Id, resultado.Valor.Destino.Id);
    }

    [Fact]
    public async Task Crear_RechazaClienteYDireccionesDeOtraEmpresa()
    {
        var fixture = await CrearFixtureAsync();
        var request = Request(fixture) with
        {
            ClienteId = fixture.ClienteAjenoId,
            OrigenDireccionId = fixture.OrigenAjenoId,
            DestinoDireccionId = fixture.DestinoAjenoId
        };

        var resultado = await fixture.Service.CrearAsync(Entorno.EmpresaA, request);

        Assert.Equal(TipoError.Validacion, resultado.Error);
    }

    [Fact]
    public async Task ListarYDetalle_ConductorSoloVeEnviosAsignadosAEl()
    {
        var fixture = await CrearFixtureAsync();
        var conductorId = Guid.NewGuid();
        var otroConductorId = Guid.NewGuid();
        var fechaTemprana = DateTimeOffset.UtcNow.AddDays(1);
        var fechaTardia = DateTimeOffset.UtcNow.AddDays(2);
        var propioTardio = NuevoEnvio(fixture, conductorId, EstadoEnvio.Asignado, fechaTardia);
        var propioTemprano = NuevoEnvio(fixture, conductorId, EstadoEnvio.Asignado, fechaTemprana);
        var propioFueraDeRango = NuevoEnvio(fixture, conductorId, EstadoEnvio.Asignado, fechaTardia.AddDays(2));
        var ajeno = NuevoEnvio(fixture, otroConductorId, EstadoEnvio.Asignado, fechaTemprana);
        fixture.Db.Envios.AddRange(propioTardio, propioTemprano, propioFueraDeRango, ajeno);
        await fixture.Db.SaveChangesAsync();

        var lista = await fixture.Service.ListarAsync(
            Entorno.EmpresaA,
            new EnvioFiltroDto
            {
                Estado = EstadoEnvio.Asignado,
                Desde = fechaTemprana,
                Hasta = fechaTardia
            },
            conductorId);
        var detalleAjeno = await fixture.Service.ObtenerAsync(
            Entorno.EmpresaA, ajeno.Id, conductorId);

        Assert.Equal(new[] { propioTemprano.Id, propioTardio.Id }, lista.Select(envio => envio.Id));
        Assert.Equal(TipoError.NoEncontrado, detalleAjeno.Error);
    }

    [Fact]
    public async Task EditarSoloPendiente_YCancelarPendienteOAsignado()
    {
        var fixture = await CrearFixtureAsync();
        var pendiente = NuevoEnvio(fixture, null, EstadoEnvio.Pendiente, DateTimeOffset.UtcNow.AddDays(1));
        var asignado = NuevoEnvio(fixture, null, EstadoEnvio.Asignado, DateTimeOffset.UtcNow.AddDays(2));
        var enCurso = NuevoEnvio(fixture, null, EstadoEnvio.EnCurso, DateTimeOffset.UtcNow.AddDays(3));
        fixture.Db.Envios.AddRange(pendiente, asignado, enCurso);
        await fixture.Db.SaveChangesAsync();

        var editarPendiente = await fixture.Service.ActualizarAsync(
            Entorno.EmpresaA,
            pendiente.Id,
            UpdateRequest(fixture, tarifa: 300m));
        var editarAsignado = await fixture.Service.ActualizarAsync(
            Entorno.EmpresaA,
            asignado.Id,
            UpdateRequest(fixture));
        var cancelarAsignado = await fixture.Service.CancelarAsync(Entorno.EmpresaA, asignado.Id);
        var cancelarPendiente = await fixture.Service.CancelarAsync(Entorno.EmpresaA, pendiente.Id);
        var cancelarEnCurso = await fixture.Service.CancelarAsync(Entorno.EmpresaA, enCurso.Id);
        var envioAjeno = NuevoEnvio(fixture, null, EstadoEnvio.Pendiente, DateTimeOffset.UtcNow.AddDays(4));
        envioAjeno.EmpresaId = Entorno.EmpresaB;
        fixture.Db.Envios.Add(envioAjeno);
        await fixture.Db.SaveChangesAsync();
        var cancelarAjeno = await fixture.Service.CancelarAsync(Entorno.EmpresaA, envioAjeno.Id);

        Assert.True(editarPendiente.Exito);
        Assert.Equal(300m, editarPendiente.Valor!.Tarifa);
        Assert.Equal(TipoError.Conflicto, editarAsignado.Error);
        Assert.Equal(EstadoEnvio.Cancelado, cancelarAsignado.Valor!.Estado);
        Assert.Equal(EstadoEnvio.Cancelado, cancelarPendiente.Valor!.Estado);
        Assert.Equal(TipoError.Conflicto, cancelarEnCurso.Error);
        Assert.Equal(TipoError.NoEncontrado, cancelarAjeno.Error);
    }

    private async Task<Fixture> CrearFixtureAsync()
    {
        var db = _entorno.CrearDb(Entorno.Tenant(Entorno.EmpresaA, "Despachador"));
        var ciudadId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var origenId = Guid.NewGuid();
        var destinoId = Guid.NewGuid();
        var clienteAjenoId = Guid.NewGuid();
        var origenAjenoId = Guid.NewGuid();
        var destinoAjenoId = Guid.NewGuid();

        db.Ciudades.Add(new Ciudad { Id = ciudadId, DepartamentoId = Guid.NewGuid(), Nombre = "Ciudad" });
        db.Clientes.AddRange(
            new Cliente
            {
                Id = clienteId,
                EmpresaId = Entorno.EmpresaA,
                PrimerNombre = "Cliente",
                PrimerApellido = "Propio",
                Telefono = "9999"
            },
            new Cliente
            {
                Id = clienteAjenoId,
                EmpresaId = Entorno.EmpresaB,
                PrimerNombre = "Cliente",
                PrimerApellido = "Ajeno",
                Telefono = "8888"
            });
        db.Direcciones.AddRange(
            NuevaDireccion(origenId, Entorno.EmpresaA, ciudadId, "Origen"),
            NuevaDireccion(destinoId, Entorno.EmpresaA, ciudadId, "Destino"),
            NuevaDireccion(origenAjenoId, Entorno.EmpresaB, ciudadId, "Origen ajeno"),
            NuevaDireccion(destinoAjenoId, Entorno.EmpresaB, ciudadId, "Destino ajeno"));
        await db.SaveChangesAsync();

        return new Fixture(
            db,
            new EnvioService(new EnvioRepository(db)),
            clienteId,
            origenId,
            destinoId,
            clienteAjenoId,
            origenAjenoId,
            destinoAjenoId);
    }

    private static Direccion NuevaDireccion(Guid id, Guid empresaId, Guid ciudadId, string calle) => new()
    {
        Id = id,
        EmpresaId = empresaId,
        CiudadId = ciudadId,
        CallePrincipal = calle
    };

    private static Envio NuevoEnvio(
        Fixture fixture,
        Guid? conductorId,
        EstadoEnvio estado,
        DateTimeOffset fecha) => new()
    {
        Id = Guid.NewGuid(),
        EmpresaId = Entorno.EmpresaA,
        ClienteId = fixture.ClienteId,
        OrigenDireccionId = fixture.OrigenId,
        DestinoDireccionId = fixture.DestinoId,
        ConductorId = conductorId,
        TipoServicio = TipoServicio.Carga,
        Estado = estado,
        PesoKg = 10m,
        FechaProgramada = fecha,
        Tarifa = 100m,
        CostoExterno = 25m
    };

    private static CrearEnvioRequestDto Request(Fixture fixture, decimal tarifa = 250m) => new()
    {
        ClienteId = fixture.ClienteId,
        OrigenDireccionId = fixture.OrigenId,
        DestinoDireccionId = fixture.DestinoId,
        TipoServicio = TipoServicio.Carga,
        PesoKg = 10m,
        FechaProgramada = DateTimeOffset.UtcNow.AddDays(1),
        Tarifa = tarifa
    };

    private static ActualizarEnvioRequestDto UpdateRequest(Fixture fixture, decimal tarifa = 250m) => new()
    {
        ClienteId = fixture.ClienteId,
        OrigenDireccionId = fixture.OrigenId,
        DestinoDireccionId = fixture.DestinoId,
        TipoServicio = TipoServicio.Carga,
        PesoKg = 10m,
        FechaProgramada = DateTimeOffset.UtcNow.AddDays(1),
        Tarifa = tarifa
    };

    private sealed record Fixture(
        QuickGoDbContext Db,
        EnvioService Service,
        Guid ClienteId,
        Guid OrigenId,
        Guid DestinoId,
        Guid ClienteAjenoId,
        Guid OrigenAjenoId,
        Guid DestinoAjenoId);

    private readonly Entorno _entorno = new();
}
