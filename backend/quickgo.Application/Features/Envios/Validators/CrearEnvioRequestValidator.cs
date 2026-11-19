using FluentValidation;
using quickgo.Application.Features.Envios.DTOs;

namespace quickgo.Application.Features.Envios.Validators;

public sealed class CrearEnvioRequestValidator : AbstractValidator<CrearEnvioRequestDto>
{
    public CrearEnvioRequestValidator()
    {
        RuleFor(request => request.ClienteId)
            .NotEmpty()
            .WithMessage("El cliente es obligatorio.");
        RuleFor(request => request.OrigenDireccionId)
            .NotEmpty()
            .WithMessage("La dirección de origen es obligatoria.");
        RuleFor(request => request.DestinoDireccionId)
            .NotEmpty()
            .NotEqual(request => request.OrigenDireccionId)
            .WithMessage("El origen y el destino son obligatorios y deben ser distintos.");
        RuleFor(request => request.TipoServicio)
            .IsInEnum()
            .WithMessage("El tipo de servicio debe ser Carga, Grua o Maquinaria.");
        RuleFor(request => request.PesoKg)
            .GreaterThan(0)
            .WithMessage("El peso debe ser mayor que cero.");
        RuleFor(request => request.VolumenM3)
            .GreaterThan(0)
            .WithMessage("El volumen debe ser mayor que cero.")
            .When(request => request.VolumenM3.HasValue);
        RuleFor(request => request.FechaProgramada)
            .Must(fecha => fecha >= DateTimeOffset.UtcNow)
            .WithMessage("La fecha programada no puede estar en el pasado.");
        RuleFor(request => request.Tarifa)
            .GreaterThan(0)
            .WithMessage("La tarifa debe ser mayor que cero.");
    }
}
