using Microsoft.EntityFrameworkCore;
using quickgo.Domain.entities;

namespace quickgo.Infrastructure.Data;

public class QuickGoDbContext: DbContext
{
    public QuickGoDbContext(DbContextOptions<QuickGoDbContext> options) : base(options)
    {
        
    }
    public DbSet<TipoVehiculo>TipoVehiculos { get; set; }
    public DbSet<Vehiculo>Vehiculos { get; set; }
    public DbSet<Empresa>Empresas  { get; set; }
    public DbSet<Pais> Paises { get; set; }
    public DbSet<Departamento> Departamentos { get; set; }
    public DbSet<Ciudad> Ciudades { get; set; }
    public DbSet<Moneda> Monedas { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Envio> Envios { get; set; }
}