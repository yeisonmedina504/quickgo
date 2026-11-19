using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using quickgo.Application.Interfaces;
using quickgo.Domain.entities;

namespace quickgo.Infrastructure.Data;

public class QuickGoDbContext : DbContext
{
    private readonly ITenantContext _tenant;

    public QuickGoDbContext(DbContextOptions<QuickGoDbContext> options, ITenantContext tenant) : base(options)
    {
        _tenant = tenant;
    }
    
    public DbSet<Empresa> Empresas { get; set; }
    public DbSet<Rol> Roles { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Conductor> Conductores { get; set; }
    public DbSet<Pais> Paises { get; set; }
    public DbSet<Departamento> Departamentos { get; set; }
    public DbSet<Ciudad> Ciudades { get; set; }
    public DbSet<Moneda> Monedas { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Direccion> Direcciones { get; set; }
    public DbSet<Factura> Facturas { get; set; }
    public DbSet<Envio> Envios { get; set; }
    public DbSet<Cotizacion> Cotizaciones { get; set; }
    public DbSet<SeguimientoEnvio> SeguimientosEnvio { get; set; }
    public DbSet<Pago> Pagos { get; set; }
    public DbSet<Subasta> Subastas { get; set; }
    public DbSet<Puja> Pujas { get; set; }
    public DbSet<TipoVehiculo> TipoVehiculos => Set<TipoVehiculo>();
    public DbSet<Vehiculo> Vehiculos => Set<Vehiculo>();
    public DbSet<DocumentoVehiculo> DocumentosVehiculo => Set<DocumentoVehiculo>();
    public DbSet<AsignacionVehiculoConductor> AsignacionesVehiculoConductor => Set<AsignacionVehiculoConductor>();

    // Lo leen los filtros globales: se evalua en cada consulta con la empresa del token.
    // Sin empresa (null) no devuelve nada (falla cerrado).
    private Guid? EmpresaActualId => _tenant.EmpresaId;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1) Nombres snake_case por defecto (tablas y columnas), como en el ERD.
        //    Las configuraciones explicitas del paso 2 tienen prioridad.
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var tabla = entity.GetTableName();
            if (tabla is not null)
            {
                entity.SetTableName(ASnake(tabla));
            }
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ASnake(property.Name));
            }
        }

        // 2) Configuraciones por entidad (IEntityTypeConfiguration)
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(QuickGoDbContext).Assembly);

        // 3) Filtro global por empresa_id para toda entidad IEmpresaScoped
        var metodo = typeof(QuickGoDbContext).GetMethod(nameof(AplicarFiltroEmpresa),
            BindingFlags.NonPublic | BindingFlags.Instance)!;
        foreach (var entity in modelBuilder.Model.GetEntityTypes()
                     .Where(t => typeof(IEmpresaScoped).IsAssignableFrom(t.ClrType)))
        {
            metodo.MakeGenericMethod(entity.ClrType).Invoke(this, new object[] { modelBuilder });
        }
    }

    private void AplicarFiltroEmpresa<T>(ModelBuilder modelBuilder) where T : class, IEmpresaScoped
    {
        modelBuilder.Entity<T>().HasQueryFilter(e =>
            EmpresaActualId != null && e.EmpresaId == EmpresaActualId);
    }

    // Al insertar, la empresa sale siempre del token (se ignora la que traiga el cuerpo).
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AsignarEmpresaAlInsertar();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        AsignarEmpresaAlInsertar();
        return base.SaveChanges();
    }

    private void AsignarEmpresaAlInsertar()
    {
        if (EmpresaActualId is not Guid empresaId)
        {
            return;
        }

        // Solo si no viene empresa: asi la adjudicacion de subasta (B5-05) puede insertar
        // filas en la empresa ganadora sin que se las cambien.
        foreach (var entry in ChangeTracker.Entries<IEmpresaScoped>()
                     .Where(e => e.State == EntityState.Added && e.Entity.EmpresaId == Guid.Empty))
        {
            entry.Entity.EmpresaId = empresaId;
        }
    }

    private static string ASnake(string nombre) =>
        Regex.Replace(nombre, "([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
}
