using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace quickgo.API.Middleware;

/// <summary>
/// Middleware global: captura ValidationException de FluentValidation y responde 400 ProblemDetails.
/// Esto cumple el requisito de Fase 2: "propagando los errores hacia la capa API mediante un Middleware global".
/// </summary>
public class GlobalValidationExceptionMiddleware {
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalValidationExceptionMiddleware> _logger;

    public GlobalValidationExceptionMiddleware(RequestDelegate next, ILogger<GlobalValidationExceptionMiddleware> logger) {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context) {
        try {
            await _next(context);
        }
        catch (ValidationException ex) {
            _logger.LogDebug(ex, "ValidationException capturada por middleware global");
            if (context.Response.HasStarted) throw;

            var errors = ex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            var problem = new ValidationProblemDetails(errors) {
                Status = StatusCodes.Status400BadRequest,
                Title = "Error de validacion",
                Detail = "Uno o mas campos no son validos."
            };

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(problem);
        }
    }
}

public static class GlobalValidationExceptionMiddlewareExtensions {
    public static IApplicationBuilder UseGlobalValidationExceptionHandler(this IApplicationBuilder app) =>
        app.UseMiddleware<GlobalValidationExceptionMiddleware>();
}
