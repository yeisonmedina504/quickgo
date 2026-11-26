# QuickGo - Backend

API REST en **.NET 10** con **PostgreSQL**. Organizada por capas:

```
backend/
|-- quickgo.Domain/          Entidades, enumeraciones y constantes (Roles). Sin dependencias.
|-- quickgo.Application/     Servicios, DTOs, validadores (FluentValidation) e interfaces de repositorio.
|-- quickgo.Infrastructure/  EF Core (DbContext, configuraciones, migraciones), repositorios, hash de contrasenas.
|-- quickgo.API/             Controllers, JWT, filtro por empresa, Program.cs.
|-- quickgo.Tests/           Pruebas xUnit (aislamiento entre empresas, roles, conductores).
|-- probar-todo.ps1          Prueba HTTP de punta a punta de todas las historias existentes.
|-- global.json              Fija la version del SDK (10.0.401).
\-- quickgo.slnx             Solucion.
```

## Requisitos

- [.NET SDK 10.0.401](https://dotnet.microsoft.com/download) (ver `global.json`)
- Docker (para PostgreSQL)
- Opcional: `dotnet tool install --global dotnet-ef` si vas a crear migraciones

## Puesta en marcha

### Opcion rapida (recomendada para desarrollo local)

No necesitas crear `.env` para la API en Development: `appsettings.Development.json` ya trae una conexion por defecto a `localhost:5433` y `MigrarAlIniciar=true`.

```bash
# 1) PostgreSQL (desde la raiz del repo)
cd infra
docker compose up -d            # Postgres 16 en localhost:5433

# 2) Ejecutar API (aplica migraciones al iniciar)
cd ../backend
dotnet run --project quickgo.API    # http://localhost:5010
```

### Opcion con .env (cuando quieras sobreescribir valores)

```bash
# 1) PostgreSQL
cd infra
cp .env.example .env            # Windows: copy .env.example .env
docker compose up -d

# 2) Variables de la API
cd ../backend/quickgo.API
cp .env.example .env            # Windows: copy .env.example .env

# 3) Ejecutar
cd ..
dotnet run --project quickgo.API
```

Las migraciones estan en `quickgo.Infrastructure/Data/Migrations` y se aplican al iniciar cuando `MigrarAlIniciar=true`.

## Datos iniciales (seed)

Las migraciones incluyen: los **4 roles**, el catalogo de **tipos de vehiculo**, **Honduras** (`HND`) y las monedas **HNL** y **USD**.

**No** incluye departamentos ni ciudades. Para probar direcciones hay que insertarlos; el bloque SQL del paso 0 de `probar-todo.ps1` carga Francisco Morazan y Cortes, Tegucigalpa y San Pedro Sula.

## Seguridad y multi-empresa

- Login con JWT. El token lleva los claims `userId`, `empresaId`, `rol` y `tipoEmpresa`.
- Ningun endpoint recibe `EmpresaId` en el cuerpo: sale del token. Si el cliente lo envia, se ignora.
- Las entidades con `EmpresaId` (`IEmpresaScoped`) tienen un **filtro global** en el `DbContext`: una empresa nunca ve ni modifica datos de otra (responde 404).
- Roles: `Admin`, `Despachador`, `Conductor` (empresas Transportista) y `Contratante` (empresas Contratante).
- Errores en formato `ProblemDetails`: 400 validacion, 401 sin token, 403 rol no permitido, 404 no encontrado/otra empresa, 409 conflicto.

### Modo Dev (solo `ASPNETCORE_ENVIRONMENT=Development`)

Permite probar sin login enviando los headers `X-Empresa-Id`, `X-User-Id`, `X-Rol` y opcionalmente `X-Tipo-Empresa`. Ejemplos en `quickgo.API/quickgo.API.http`. En cualquier otro entorno estos headers se ignoran.

## Endpoints

Rutas bajo `/api`. "Todos" = cualquier usuario autenticado.

### Identidad (B1)

| Metodo y ruta | Roles |
|---|---|
| `POST /empresas/registro` | publico |
| `POST /auth/login` | publico |
| `GET /catalogos/roles` | Admin |
| `POST /usuarios`, `GET /usuarios`, `PUT /usuarios/{id}`, `PATCH /usuarios/{id}/desactivar` | Admin |
| `POST /conductores`, `PUT /conductores/{id}` | Admin, Despachador |
| `GET /conductores`, `GET /conductores/{id}` | Admin, Despachador, Conductor (solo el suyo) |
| `GET /conductores/{id}/asignaciones` | Admin, Despachador, Conductor (solo las suyas) |
| `GET /conductores/licencias-por-vencer?dias=30` | Admin, Despachador |

### Flota (B2)

| Metodo y ruta | Roles |
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

### Catalogos, clientes, direcciones y facturacion (B3)

| Metodo y ruta | Roles |
|---|---|
| `GET /catalogos/paises`, `/departamentos?paisId`, `/ciudades?departamentoId`, `/monedas` | Todos |
| `POST /clientes`, `GET /clientes?buscar=`, `PUT /clientes/{id}` | Admin, Despachador |
| `POST /direcciones`, `GET /direcciones?clienteId=`, `PUT /direcciones/{id}` | Admin, Despachador, Contratante |
| `POST /facturas` | Admin |
| `GET /facturas?estado=`, `GET /facturas/{id}` | Admin, Despachador |
| `POST /facturas/{id}/pagos` | Admin |

### Envios, cotizaciones y seguimiento (B4)

| Metodo y ruta | Roles |
|---|---|
| `POST /envios` | Admin, Despachador |
| `GET /envios`, `GET /envios/{id}` | Admin, Despachador, Conductor (el conductor solo ve los suyos) |
| `PUT /envios/{id}` | Admin, Despachador |
| `PATCH /envios/{id}/cancelar` | Admin, Despachador |
| `PATCH /envios/{id}/asignar` | Admin, Despachador |
| `PATCH /envios/{id}/estado` | Admin, Despachador, Conductor |
| `POST /envios/{id}/cotizaciones` | Admin, Despachador |
| `GET /envios/{id}/cotizaciones` | Admin, Despachador, Conductor |
| `PATCH /envios/{id}/cotizaciones/{cotizacionId}/aceptar` | Admin, Despachador |
| `POST /envios/{id}/seguimiento` | Conductor |
| `GET /envios/{id}/seguimiento`, `GET /envios/{id}/seguimiento/ultimo` | Admin, Despachador, Conductor |

Reglas clave: solo se edita un envio `Pendiente`; asignar requiere vehiculo/conductor de la empresa y seguro vigente; el conductor solo marca `EnCurso`/`Completado` en sus envios; seguimiento solo en envios `EnCurso`.

### Subastas (B5)

| Metodo y ruta | Roles |
|---|---|
| `POST /subastas`, `GET /subastas/mias?estado=`, `GET /subastas/{id}`, `PATCH /subastas/{id}/cancelar` | Contratante (dueno) |
| `GET /subastas/abiertas?tipoVehiculoId=` | Admin, Despachador |
| `POST /subastas/{id}/pujas` | Admin, Despachador |
| `GET /subastas/{id}/mejor-oferta` | Admin, Despachador, Contratante |
| `DELETE /subastas/{id}/pujas/mia` | Admin, Despachador |
| `GET /subastas/{id}/pujas` | Contratante (dueno) |
| `PATCH /subastas/{id}/adjudicar` | Contratante (dueno) |

El cierre automatico **no usa temporizador**: al consultar/listar subastas abiertas, `SubastaCierreService` pasa a `Vencida` las que ya superaron `fechaCierre` y marca sus pujas activas como `Perdedora`. La adjudicacion es transaccional: crea/reusa cliente y copia direcciones en la empresa ganadora, crea el envio `Pendiente`, marca la puja ganadora/perdedoras y la subasta como `Adjudicada`.

### Salud

`GET /health` (publico) -> `200 {"status":"Healthy"}` si hay conexion con la base.

## Pruebas

```bash
dotnet test                       # pruebas xUnit con EF Core InMemory (no necesitan Docker)
```

Prueba de punta a punta contra la API real (PowerShell, con la API y Postgres corriendo):

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\probar-todo.ps1
# Con el compose de infra/ o defaults distintos:
powershell -ExecutionPolicy Bypass -File .\probar-todo.ps1 -Contenedor quickgo-pg -Usuario postgres -Db quickgo -Base http://localhost:5010
```

- Cada ejecucion crea empresas con datos unicos, asi que se puede repetir sin limpiar la base.
- `-SinEsperaCierre` omite la espera de ~50 s de la prueba de cierre automatico.
- El script inserta catalogos usando `wsl docker exec ... psql`. Si Docker corre nativo en Windows, quita `wsl` en la funcion `Psql`.
- Cubre B1, B2 (excepto B2-05), B3, B4 y B5 (excepto B3-05/B2-05). El conteo exacto de PASS puede variar levemente con ajustes del script; al final debe reportar `FAIL: 0`.

## Migraciones

```bash
cd backend
dotnet ef migrations add NombreCambio --project quickgo.Infrastructure --startup-project quickgo.API --output-dir Data/Migrations
```

Un cambio de columnas se avisa al equipo y se sube en un PR aparte.

## Pendiente en el backend

- B2-05: Dockerfile de la API y `docker-compose` completo (API + PostgreSQL). (excluido por ahora)
- B3-05: GitHub Actions (CI/CD). (excluido por ahora)
