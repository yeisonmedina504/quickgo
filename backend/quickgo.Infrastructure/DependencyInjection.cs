using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using quickgo.Application.Interfaces;
using quickgo.Infrastructure.Data;
using quickgo.Infrastructure.Repositories;
using quickgo.Application.Features.Subastas;
using quickgo.Infrastructure.Security;

namespace quickgo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {

        // 1. Acceso a PostgreSQL
        services.AddDbContext<QuickGoDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();

        // 2. Repositorios
        services.AddScoped<IDireccionRepository, DireccionRepository>();
        services.AddScoped<IEnvioRepository, EnvioRepository>();
        services.AddScoped<IFacturaRepository, FacturaRepository>();
        services.AddScoped<IVehiculoRepository, VehiculoRepository>();
        services.AddScoped<ITipoVehiculoRepository, TipoVehiculoRepository>();
        services.AddScoped<IDocumentoVehiculoRepository, DocumentoVehiculoRepository>();
        services.AddScoped<IAsignacionRepository, AsignacionRepository>();
        services.AddScoped<IEmpresaRepository, EmpresaRepository>();
        services.AddScoped<ISubastaRepository, SubastaRepository>();
        services.AddScoped<SubastaCierreService>();
        services.AddScoped<IRolRepository, RolRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IConductorRepository, ConductorRepository>();
        services.AddScoped<IClienteRepository, ClienteRepository>();
        services.AddScoped<ICatalogoGeograficoRepository, CatalogoGeograficoRepository>();
        services.AddScoped<IMonedaRepository, MonedaRepository>();

        return services;
    }
}
