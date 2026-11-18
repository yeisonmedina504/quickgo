using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quickgo.Domain.entities;

namespace quickgo.Infrastructure.Persistence.Configurations;

public class EnvioConfiguration : IEntityTypeConfiguration<Envio>
{
    public void Configure(EntityTypeBuilder<Envio> builder)
    {
        builder.ToTable("envios");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("id");

        builder.Property(e => e.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(e => e.ClienteId)
            .HasColumnName("cliente_id")
            .IsRequired();

        builder.Property(e => e.SubastaId)
            .HasColumnName("subasta_id")
            .IsRequired(false);

        builder.Property(e => e.OrigenDireccionId)
            .HasColumnName("origen_direccion_id")
            .IsRequired();

        builder.Property(e => e.DestinoDireccionId)
            .HasColumnName("destino_direccion_id")
            .IsRequired();

        builder.Property(e => e.VehiculoId)
            .HasColumnName("vehiculo_id")
            .IsRequired(false);

        builder.Property(e => e.ConductorId)
            .HasColumnName("conductor_id")
            .IsRequired(false);

        builder.Property(e => e.TipoServicio)
            .HasColumnName("tipo_servicio")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.Estado)
            .HasColumnName("estado")
            .HasMaxLength(30)
            .HasDefaultValue("Pendiente")
            .IsRequired();

        builder.Property(e => e.PesoKg)
            .HasColumnName("peso_kg")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(e => e.VolumenM3)
            .HasColumnName("volumen_m3")
            .HasPrecision(10, 2)
            .IsRequired(false);

        builder.Property(e => e.FechaProgramada)
            .HasColumnName("fecha_programada")
            .IsRequired();

        builder.Property(e => e.Tarifa)
            .HasColumnName("tarifa")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(e => e.CostoExterno)
            .HasColumnName("costo_externo")
            .HasPrecision(12, 2)
            .IsRequired();

         builder.HasOne<Empresa>()
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Cliente>()
            .WithMany()
            .HasForeignKey(e => e.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        // builder.HasOne<Direccion>()
        //     .WithMany()
        //     .HasForeignKey(e => e.OrigenDireccionId)
        //     .OnDelete(DeleteBehavior.Restrict);

        // builder.HasOne<Direccion>()
        //     .WithMany()
        //     .HasForeignKey(e => e.DestinoDireccionId)
        //     .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Subasta>()
            .WithMany()
            .HasForeignKey(e => e.SubastaId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<Vehiculo>()
            .WithMany()
            .HasForeignKey(e => e.VehiculoId)
            .OnDelete(DeleteBehavior.SetNull);

        // builder.HasOne<Conductor>()
        //     .WithMany()
        //     .HasForeignKey(e => e.ConductorId)
        //     .OnDelete(DeleteBehavior.SetNull);
    }
}