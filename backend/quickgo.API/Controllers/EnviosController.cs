using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quickgo.API.Security;
using quickgo.Application.Features.Envios.DTOs;
using quickgo.Application.Interfaces;
using quickgo.Domain.Constants;

namespace quickgo.API.Controllers;

[ApiController]
[Route("api/envios")]
[Authorize]
public sealed class EnviosController : ApiControllerBase
{
    private readonly IEnvioService _service;
    private readonly ITenantContext _tenant;
    private readonly IValidator<CrearEnvioRequestDto> _crearValidator;
    private readonly IValidator<ActualizarEnvioRequestDto> _actualizarValidator;
    private readonly IValidator<EnvioFiltroDto> _filtroValidator;

    public EnviosController(
        IEnvioService service,
        ITenantContext tenant,
        IValidator<CrearEnvioRequestDto> crearValidator,
        IValidator<ActualizarEnvioRequestDto> actualizarValidator,
        IValidator<EnvioFiltroDto> filtroValidator)
    {
        _service = service;
        _tenant = tenant;
        _crearValidator = crearValidator;
        _actualizarValidator = actualizarValidator;
        _filtroValidator = filtroValidator;
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminDespachador)]
    [EndpointSummary("Crear un envío")]
    [EndpointDescription("Roles: Admin, Despachador. Cliente y direcciones deben pertenecer a la empresa. El estado inicial es Pendiente.")]
    [ProducesResponseType(typeof(EnvioResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearEnvioRequestDto request,
        CancellationToken cancellationToken)
    {
        var errorValidacion = await ValidarAsync(_crearValidator, request, cancellationToken);
        if (errorValidacion is not null) return errorValidacion;
        if (!TryGetEmpresaId(out var empresaId)) return TokenSinEmpresa();

        return Creado(
            await _service.CrearAsync(empresaId, request, cancellationToken),
            envio => $"/api/envios/{envio.Id}");
    }

    [HttpGet]
    [Authorize(Roles = Roles.AdminDespachadorConductor)]
    [EndpointSummary("Listar envíos")]
    [EndpointDescription("Roles: Admin, Despachador, Conductor. Filtros opcionales estado, desde y hasta; el conductor solo consulta los envíos asignados a su usuario.")]
    [ProducesResponseType(typeof(IEnumerable<EnvioResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Listar(
        [FromQuery] EnvioFiltroDto filtro,
        CancellationToken cancellationToken)
    {
        var errorValidacion = await ValidarAsync(_filtroValidator, filtro, cancellationToken);
        if (errorValidacion is not null) return errorValidacion;
        if (!TryGetEmpresaId(out var empresaId)) return TokenSinEmpresa();
        if (!ObtenerConductorId(out var conductorId)) return TokenSinConductor();

        return Ok(await _service.ListarAsync(empresaId, filtro, conductorId, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AdminDespachadorConductor)]
    [EndpointSummary("Ver detalle de un envío")]
    [EndpointDescription("Roles: Admin, Despachador, Conductor. Incluye cliente, direcciones y margen. El conductor solo consulta sus envíos; los de otra empresa responden 404.")]
    [ProducesResponseType(typeof(EnvioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Obtener(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetEmpresaId(out var empresaId)) return TokenSinEmpresa();
        if (!ObtenerConductorId(out var conductorId)) return TokenSinConductor();

        return Responder(await _service.ObtenerAsync(
            empresaId, id, conductorId, cancellationToken));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.AdminDespachador)]
    [EndpointSummary("Editar un envío pendiente")]
    [EndpointDescription("Roles: Admin, Despachador. Solo se puede editar mientras está Pendiente. Envíos de otra empresa responden 404.")]
    [ProducesResponseType(typeof(EnvioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Editar(
        Guid id,
        [FromBody] ActualizarEnvioRequestDto request,
        CancellationToken cancellationToken)
    {
        var errorValidacion = await ValidarAsync(_actualizarValidator, request, cancellationToken);
        if (errorValidacion is not null) return errorValidacion;
        if (!TryGetEmpresaId(out var empresaId)) return TokenSinEmpresa();

        return Responder(await _service.ActualizarAsync(
            empresaId, id, request, cancellationToken));
    }

    [HttpPatch("{id:guid}/cancelar")]
    [Authorize(Roles = Roles.AdminDespachador)]
    [EndpointSummary("Cancelar un envío")]
    [EndpointDescription("Roles: Admin, Despachador. Solo se puede cancelar desde Pendiente o Asignado. Envíos de otra empresa responden 404.")]
    [ProducesResponseType(typeof(EnvioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Cancelar(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetEmpresaId(out var empresaId)) return TokenSinEmpresa();

        return Responder(await _service.CancelarAsync(empresaId, id, cancellationToken));
    }

    private async Task<IActionResult?> ValidarAsync<T>(
        IValidator<T> validator,
        T request,
        CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(request, cancellationToken);
        return result.IsValid
            ? null
            : ValidationProblem(new ValidationProblemDetails(result.ToDictionary()));
    }

    private bool TryGetEmpresaId(out Guid empresaId)
    {
        empresaId = _tenant.EmpresaId.GetValueOrDefault();
        return empresaId != Guid.Empty;
    }

    private bool ObtenerConductorId(out Guid? conductorId)
    {
        conductorId = null;
        if (!User.IsInRole(Roles.Conductor))
        {
            return true;
        }

        conductorId = _tenant.UserId;
        return conductorId.HasValue && conductorId.Value != Guid.Empty;
    }

    private IActionResult TokenSinEmpresa() =>
        Problem(statusCode: StatusCodes.Status401Unauthorized,
            title: "Token inválido", detail: "El token no tiene una empresa.");

    private IActionResult TokenSinConductor() =>
        Problem(statusCode: StatusCodes.Status401Unauthorized,
            title: "Token inválido", detail: "El token no tiene un usuario conductor.");
}
