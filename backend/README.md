# QuickGo – Backend

API REST en **.NET 10** con **PostgreSQL**. Organizada por capas:

```
backend/
├── quickgo.Domain/          Entidades, enumeraciones y constantes (Roles). Sin dependencias.
├── quickgo.Application/     Servicios, DTOs, validadores (FluentValidation) e interfaces de repositorio.
├── quickgo.Infrastructure/  EF Core (DbContext, configuraciones, migraciones), repositorios, hash de contraseñas.
├── quickgo.API/             Controllers, JWT, filtro por empresa, Program.cs.
├── quickgo.Tests/           Pruebas xUnit (aislamiento entre empresas, roles, conductores).
├── probar-todo.ps1          Prueba HTTP de punta a punta de todas las historias existentes.
├── global.json              Fija la versión del SDK (10.0.401).
└── quickgo.slnx             Solución.
```

## Requisitos

- [.NET SDK 10.0.401](https://dotnet.microsoft.com/download) (ver `global.json`)
- Docker (para PostgreSQL)
- Opcional: `dotnet tool install --global dotnet-ef` si vas a crear migraciones

## Puesta en marcha

```bash
# 1) PostgreSQL (desde la raíz del repo)
cd infra
cp .env.example .env
docker compose up -d            # Postgres 16 en localhost:5433

# 2) Variables de la API
cd ../backend/quickgo.API
cp .env.example .env

# 3) Ejecutar
cd ..
dotnet run --project quickgo.API    # http://localhost:5010
```

Al iniciar, si `MigrarAlIniciar=true`, la API aplica las migraciones pendientes (`MigracionesHostedService`). La migración inicial ya está en el repo (`quickgo.Infrastructure/Data/Migrations`).

### Variables de entorno

Se leen del archivo `quickgo.API/.env` (no se sube a git) o de variables del sistema.

| Variable | Descripción |
|---|---|
| `ConnectionStrings__PostgresConnection` | Cadena de conexión. Debe coincidir con `infra/.env` (puerto **5433**). |
| `Jwt__Key` | Clave de firma del JWT, **mínimo 32 caracteres**. Obligatoria fuera de Development. |
| `Jwt__ExpiraMinutos` | Duración del token (60 por defecto). |
| `MigrarAlIniciar` | `true` aplica migraciones al arrancar. En `appsettings.json` es `false`; en Development es `true`. |

`appsettings.Development.json` trae una clave JWT de desarrollo; **nunca la uses en producción**.

## Datos iniciales (seed)

La migración ya incluye: los **4 roles** y el catálogo de **tipos de vehículo**.

**No** incluye países, departamentos, ciudades ni monedas. Para probar catálogos y direcciones hay que insertarlos; el bloque SQL del paso 0 de `probar-todo.ps1` carga Honduras (Francisco Morazán y Cortés, Tegucigalpa y San Pedro Sula) y las monedas HNL y USD.

## Seguridad y multi-empresa

- Login con JWT. El token lleva los claims `userId`, `empresaId`, `rol` y `tipoEmpresa`.
- Ningún endpoint recibe `EmpresaId` en el cuerpo: sale del token. Si el cliente lo envía, se ignora.
- Las entidades con `EmpresaId` (`IEmpresaScoped`) tienen un **filtro global** en el `DbContext`: una empresa nunca ve ni modifica datos de otra (responde 404).
- Roles: `Admin`, `Despachador`, `Conductor` (empresas Transportista) y `Contratante` (empresas Contratante).
- Errores en formato `ProblemDetails`: 400 validación, 401 sin token, 403 rol no permitido, 404 no encontrado/otra empresa, 409 conflicto.

### Modo Dev (solo `ASPNETCORE_ENVIRONMENT=Development`)

Permite probar sin login enviando los headers `X-Empresa-Id`, `X-User-Id`, `X-Rol` y opcionalmente `X-Tipo-Empresa`. Ejemplos en `quickgo.API/quickgo.API.http`. En cualquier otro entorno estos headers se ignoran.

## Endpoints

Rutas bajo `/api`. “Todos” = cualquier usuario autenticado.

### Identidad (B1)

| Método y ruta | Roles |
|---|---|
| `POST /empresas/registro` | público |
| `POST /auth/login` | público |
| `GET /catalogos/roles` | Admin |
| `POST /usuarios`, `GET /usuarios`, `PUT /usuarios/{id}`, `PATCH /usuarios/{id}/desactivar` | Admin |
| `POST /conductores`, `PUT /conductores/{id}` | Admin, Despachador |
| `GET /conductores`, `GET /conductores/{id}` | Admin, Despachador, Conductor (solo el suyo) |
| `GET /conductores/licencias-por-vencer?dias=30` | Admin, Despachador |

### Flota (B2)

| Método y ruta | Roles |
|---|---|
| `GET /catalogos/tipos-vehiculo` | Admin, Despachador, Conductor |
| `GET /vehiculos`, `GET /vehiculos/{id}` | Admin, Despachador, Conductor |
| `POST /vehiculos`, `PUT /vehiculos/{id}` | Admin, Despachador |
| `PATCH /vehiculos/{id}/baja` | Admin |
| `POST /vehiculos/{id}/documentos` | Admin |
| `GET /vehiculos/{id}/documentos` | Admin, Despachador |
| `GET /documentos/por-vencer?dias=30` | Admin, Despachador |
| `POST /asignaciones` | Admin, Despachador |
| `PATCH /asignaciones/{id}/finalizar` | Admin, Despachador, Conductor |
| `GET /vehiculos/{id}/asignaciones` | Admin, Despachador, Conductor (solo las suyas) |

### Catálogos, clientes, direcciones y facturación (B3)

| Método y ruta | Roles |
|---|---|
| `GET /catalogos/paises`, `/departamentos?paisId`, `/ciudades?departamentoId`, `/monedas` | Todos |
| `POST /clientes`, `GET /clientes?buscar=`, `PUT /clientes/{id}` | Admin, Despachador |
| `POST /direcciones`, `GET /direcciones?clienteId=`, `PUT /direcciones/{id}` | Admin, Despachador, Contratante |
| `POST /facturas` | Admin |
| `GET /facturas?estado=`, `GET /facturas/{id}` | Admin, Despachador |
| `POST /facturas/{id}/pagos` | Admin |

### Envíos (B4)

| Método y ruta | Roles |
|---|---|
| `POST /envios` | Admin, Despachador |
| `GET /envios?estado=&desde=&hasta=`, `GET /envios/{id}` | Admin, Despachador, Conductor (solo los asignados) |
| `PUT /envios/{id}`, `PATCH /envios/{id}/cancelar` | Admin, Despachador |

El envío requiere un cliente y dos direcciones de la empresa; solo se edita en estado `Pendiente` y se cancela desde `Pendiente` o `Asignado`. El detalle incluye cliente, direcciones y margen (`tarifa - costo_externo`).

### Subastas (B5)

| Método y ruta | Roles |
|---|---|
| `POST /subastas`, `GET /subastas/mias?estado=`, `GET /subastas/{id}`, `PATCH /subastas/{id}/cancelar` | Contratante (dueño) |

El cierre automático **no usa temporizador**: al consultar una subasta `Abierta` cuya `fechaCierre` ya pasó, `SubastaCierreService` la pasa a `Vencida` y sus pujas activas a `Perdedora`.

### Salud

`GET /health` (público) → `200 {"status":"Healthy"}` si hay conexión con la base.

## Pruebas

```bash
dotnet test                       # pruebas xUnit con EF Core InMemory (no necesitan Docker)
```

Prueba de punta a punta contra la API real (PowerShell, con la API y Postgres corriendo):

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\probar-todo.ps1
# Con el compose de infra/:
powershell -ExecutionPolicy Bypass -File .\probar-todo.ps1 -Contenedor postgres-quickgo -Usuario quickgo
```

- Cada ejecución crea empresas con datos únicos, así que se puede repetir sin limpiar la base.
- `-SinEsperaCierre` omite la espera de ~50 s de la prueba de cierre automático.
- El script inserta catálogos y envíos de prueba usando `wsl docker exec … psql`. Si Docker corre nativo en Windows, quita `wsl` en la función `Psql`.
- Resultado esperado hoy: **187 PASS, 0 FAIL**.

## Migraciones

```bash
cd backend
dotnet ef migrations add NombreCambio --project quickgo.Infrastructure --startup-project quickgo.API --output-dir Data/Migrations
```

Un cambio de columnas se avisa al equipo y se sube en un PR aparte.

## Pendiente en el backend

- B2-04: `GET /api/conductores/{id}/asignaciones`.
- B2-05: Dockerfile de la API y `docker-compose` completo (API + PostgreSQL).
- B3-05: GitHub Actions (CI/CD).
- B4: cotizaciones y seguimiento de envíos.
- B5-03 … B5-05: pujar, mejor oferta, retirar puja y adjudicar.
