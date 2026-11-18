namespace quickgo.Domain.entities;

public class Empresa
{
    
    public int EmpresaId { get; set; }
    public string NombreComercial  { get; set; } = string.Empty;
    public string RazonSocial { get; set; } = string.Empty;
    public string RTN { get; set; } =  string.Empty;
    public string TipoComercial { get; set; } =  string.Empty;
    public string Plan { get; set; } =  string.Empty;
    public bool Activa { get; set; }
}