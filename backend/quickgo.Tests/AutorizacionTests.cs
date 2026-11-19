using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quickgo.API.Controllers;
using quickgo.Domain.Constants;

namespace quickgo.Tests;

/// <summary>
/// Matriz de permisos por rol: se lee de los atributos [Authorize] de cada endpoint
/// y se comprueba para cada uno de los cuatro roles.
/// </summary>
public class AutorizacionTests {
    // (controlador, accion, roles que deben poder entrar)
    public static IEnumerable<object[]> Matriz() {
        yield return Fila(typeof(UsuariosController), nameof(UsuariosController.Crear), Roles.Admin);
        yield return Fila(typeof(UsuariosController), nameof(UsuariosController.Listar), Roles.Admin);
        yield return Fila(typeof(UsuariosController), nameof(UsuariosController.Editar), Roles.Admin);
        yield return Fila(typeof(UsuariosController), nameof(UsuariosController.Desactivar), Roles.Admin);
        yield return Fila(typeof(RolesController), nameof(RolesController.GetRoles), Roles.Admin);
        yield return Fila(typeof(ConductoresController), nameof(ConductoresController.Crear), Roles.Admin, Roles.Despachador);
        yield return Fila(typeof(ConductoresController), nameof(ConductoresController.Editar), Roles.Admin, Roles.Despachador);
        yield return Fila(typeof(ConductoresController), nameof(ConductoresController.LicenciasPorVencer), Roles.Admin, Roles.Despachador);
        yield return Fila(typeof(ConductoresController), nameof(ConductoresController.Listar), Roles.Admin, Roles.Despachador, Roles.Conductor);
        yield return Fila(typeof(ConductoresController), nameof(ConductoresController.Obtener), Roles.Admin, Roles.Despachador, Roles.Conductor);
        yield return Fila(typeof(EnviosController), nameof(EnviosController.Crear), Roles.Admin, Roles.Despachador);
        yield return Fila(typeof(EnviosController), nameof(EnviosController.Listar), Roles.Admin, Roles.Despachador, Roles.Conductor);
        yield return Fila(typeof(EnviosController), nameof(EnviosController.Obtener), Roles.Admin, Roles.Despachador, Roles.Conductor);
        yield return Fila(typeof(EnviosController), nameof(EnviosController.Editar), Roles.Admin, Roles.Despachador);
        yield return Fila(typeof(EnviosController), nameof(EnviosController.Cancelar), Roles.Admin, Roles.Despachador);
    }

    private static object[] Fila(Type controlador, string accion, params string[] permitidos) =>
        new object[] { controlador, accion, permitidos };

    [Theory]
    [MemberData(nameof(Matriz))]
    public void CadaRol_SoloEntraDondeLeCorresponde(Type controlador, string accion, string[] permitidos) {
        var metodo = controlador.GetMethod(accion)!;

        foreach (var rol in Roles.Todos) {
            Assert.Equal(permitidos.Contains(rol), RolPuedeEntrar(controlador, metodo, rol));
        }
    }

    [Theory]
    [InlineData(typeof(EmpresasController), nameof(EmpresasController.Registro))]
    [InlineData(typeof(AuthController), nameof(AuthController.Login))]
    public void RegistroYLogin_SonPublicos(Type controlador, string accion) {
        Assert.NotNull(controlador.GetMethod(accion)!.GetCustomAttribute<AllowAnonymousAttribute>());
    }

    [Fact]
    public void SinAtributoAuthorize_NingunEndpointDeIdentidadQuedaAbierto_SalvoRegistroYLogin() {
        var controladores = new[] {
            typeof(UsuariosController), typeof(RolesController), typeof(ConductoresController)
        };

        foreach (var c in controladores) {
            Assert.NotNull(c.GetCustomAttribute<AuthorizeAttribute>());
            Assert.Null(c.GetCustomAttribute<AllowAnonymousAttribute>());
        }
    }

    // Un usuario pasa si cumple TODOS los [Authorize] (clase y metodo); dentro de uno, basta uno de los roles.
    private static bool RolPuedeEntrar(Type controlador, MethodInfo metodo, string rol) {
        var atributos = controlador.GetCustomAttributes<AuthorizeAttribute>()
            .Concat(metodo.GetCustomAttributes<AuthorizeAttribute>());

        return atributos.All(a => string.IsNullOrEmpty(a.Roles)
            || a.Roles.Split(',', StringSplitOptions.TrimEntries).Contains(rol));
    }
}
