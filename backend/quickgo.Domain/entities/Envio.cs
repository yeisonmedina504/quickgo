namespace quickgo.Domain.entities;

public class Envio {
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid ClienteId { get; set; }
    public Guid? SubastaId { get; set; }
    public Guid OrigenDireccionId { get; set; }
    public Guid DestinoDireccionId { get; set; }
    public Guid? VehiculoId { get; set; }
    public Guid? ConductorId { get; set; }
    public string TipoServicio { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente";
    public decimal PesoKg { get; set; }
    public decimal? VolumenM3 { get; set; }
    public DateTimeOffset FechaProgramada { get; set; }
    public decimal Tarifa { get; set; }
    public decimal CostoExterno { get; set; }
}
