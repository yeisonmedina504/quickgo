using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using quickgo.Application.Features.Clientes.Validators;
using quickgo.Application.Features.Envios;
using quickgo.Application.Interfaces;
using quickgo.Application.Services;

namespace quickgo.Application;

public static class DependencyInjection {
    public static IServiceCollection AddApplication(this IServiceCollection services) {
        // Todos los validadores de FluentValidation de este ensamblado
        services.AddValidatorsFromAssemblyContaining<ClienteValidator>();

        // Servicios del modulo de Identidad
        services.AddScoped<EmpresaService>();
        services.AddScoped<AuthService>();
        services.AddScoped<RolService>();
        services.AddScoped<UsuarioService>();
        services.AddScoped<ConductorService>();
        services.AddScoped<IEnvioService, EnvioService>();

        return services;
    }
}
