using FluentValidation;
using quickgo.Application.Features.Envios.DTOs;

namespace quickgo.Application.Features.Envios.Validators;

public sealed class AsignarEnvioRequestValidator : AbstractValidator<AsignarEnvioRequestDto>
{
    public AsignarEnvioRequestValidator()
    {
        RuleFor(request => request.AsignacionId)
            .NotEmpty()
            .WithMessage("La asignación vehículo-conductor es obligatoria.");
        RuleFor(request => request.CostoExterno)
            .GreaterThanOrEqualTo(0)
            .When(request => request.CostoExterno.HasValue)
            .WithMessage("El costo externo debe ser mayor o igual a cero.");
    }
}
