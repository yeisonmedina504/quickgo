using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Text.Json.Serialization;
using quickgo.Infrastructure;
using quickgo.Infrastructure.Data;
using quickgo.API.Middleware;
using quickgo.API.Security;
using quickgo.Application;
using Scalar.AspNetCore;

// Carga el .env (si existe) ANTES de crear el builder para que la configuración lo vea.
try
{
    Env.TraversePath().Load();
}
catch (FileNotFoundException)
{
    // Sin .env: se usan las variables de entorno del sistema.
}

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("PostgresConnection")
                       ?? Environment.GetEnvironmentVariable("ConnectionStrings__PostgresConnection")
                       ?? (builder.Environment.IsDevelopment()
                           ? "Host=localhost;Port=5433;Database=quickgo;Username=quickgo;Password=quickgo_dev"
                           : null)
                       ?? throw new InvalidOperationException(
                           "Falta la cadena de conexion. Define ConnectionStrings__PostgresConnection o ConnectionStrings:PostgresConnection.");



builder.Services.AddApplication();
builder.Services.AddInfrastructure(connectionString);
builder.Services.AddQuickGoAuth(builder.Configuration, builder.Environment);
builder.Services.AddHostedService<MigracionesHostedService>();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new()
        {
            Title = "QuickGo API",
            Version = "v1",
            Description = "API REST de QuickGo. Autenticacion JWT Bearer. La empresa se toma del token (empresaId); no enviar empresaId en el body. Errores en formato ProblemDetails."
        };
        document.Components ??= new();
        document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            Type = Microsoft.OpenApi.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.ParameterLocation.Header,
            Description = "Ingresa el token JWT obtenido en POST /api/auth/login."
        };
        return Task.CompletedTask;
    });
    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        var metadata = context.Description.ActionDescriptor.EndpointMetadata;
        var hasAuthorize = metadata.OfType<Microsoft.AspNetCore.Authorization.IAuthorizeData>().Any();
        var hasAllowAnonymous = metadata.OfType<Microsoft.AspNetCore.Authorization.IAllowAnonymous>().Any();
        if (hasAuthorize && !hasAllowAnonymous)
        {
            operation.Security ??= [];
            var requirement = new Microsoft.OpenApi.OpenApiSecurityRequirement
            {
                [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", null)] = []
            };
            operation.Security.Add(requirement);
        }
        return Task.CompletedTask;
    });
});
builder.Services.AddProblemDetails();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        // Los enums viajan como texto con el nombre exacto de cada valor
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var app = builder.Build();

app.UseGlobalValidationExceptionHandler();

app.MapGet("/health", async (QuickGoDbContext dbContext, CancellationToken cancellationToken) =>
    await dbContext.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "Healthy" })
        : Results.StatusCode(StatusCodes.Status503ServiceUnavailable));
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("QuickGo API")
            .WithTheme(ScalarTheme.Default)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}
else
{
    app.UseExceptionHandler();
}

app.UseStatusCodePages(); // 401, 403 y 404 también salen como ProblemDetails
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
