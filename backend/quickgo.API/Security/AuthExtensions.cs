using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using quickgo.Application.Interfaces;

namespace quickgo.API.Security;

public static class AuthExtensions {
    private const string EsquemaInteligente = "JwtODev";

    public static IServiceCollection AddQuickGoAuth(this IServiceCollection services,
        IConfiguration configuration, IHostEnvironment env) {

        var jwt = configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
        if (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Length < 32) {
            throw new InvalidOperationException(
                "Falta la clave del JWT. Define Jwt__Key (mínimo 32 caracteres) en el .env o en variables de entorno.");
        }

        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.AddSingleton<ITokenService, JwtTokenService>();

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
        var encRaw = string.IsNullOrWhiteSpace(jwt.EncryptionKey) ? jwt.Key : jwt.EncryptionKey;
        var encBytes = Encoding.UTF8.GetBytes(encRaw);
        var encryptionKey = new SymmetricSecurityKey(encBytes.Length == 32 ? encBytes : System.Security.Cryptography.SHA256.HashData(encBytes));

        var auth = services.AddAuthentication(EsquemaInteligente)
            // En Development, si llega X-Empresa-Id se usa el modo Dev; en cualquier otro caso, JWT.
            .AddPolicyScheme(EsquemaInteligente, "JWT o headers Dev", options => {
                options.ForwardDefaultSelector = context =>
                    env.IsDevelopment() && context.Request.Headers.ContainsKey(DevHeaders.Empresa)
                        ? DevHeaderAuthHandler.Scheme
                        : JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options => {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    TokenDecryptionKey = encryptionKey,
                    ClockSkew = TimeSpan.FromMinutes(1),
                    NameClaimType = ClaimNames.UserId,
                    RoleClaimType = ClaimNames.Rol
                };
            });

        if (env.IsDevelopment()) {
            auth.AddScheme<AuthenticationSchemeOptions, DevHeaderAuthHandler>(DevHeaderAuthHandler.Scheme, _ => { });
        }

        services.AddAuthorization();
        services.AddHttpContextAccessor();
        services.AddScoped<ITenantContext, HttpTenantContext>();

        return services;
    }
}
