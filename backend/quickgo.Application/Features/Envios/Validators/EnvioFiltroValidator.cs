using FluentValidation;
using quickgo.Application.Features.Envios.DTOs;

namespace quickgo.Application.Features.Envios.Validators;

public sealed class EnvioFiltroValidator : AbstractValidator<EnvioFiltroRequestDto>
{
    public EnvioFiltroValidator()
    {
        RuleFor(filtro => filtro.Estado)
            .Must(estado => !estado.HasValue || Enum.IsDefined(estado.Value))
            .WithMessage("El estado del envío no es válido.");
        RuleFor(filtro => filtro)
            .Must(filtro => !filtro.Desde.HasValue
                            || !filtro.Hasta.HasValue
                            || filtro.Desde.Value <= filtro.Hasta.Value)
            .WithMessage("La fecha Desde no puede ser posterior a Hasta.");
    }
}
