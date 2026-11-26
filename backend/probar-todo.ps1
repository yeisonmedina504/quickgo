<#
 QuickGo - Prueba automatica de TODAS las historias que existen hoy.
 Uso (con la API corriendo y Postgres arriba):
     powershell -ExecutionPolicy Bypass -File .\probar-todo.ps1
 Parametros: -Base (URL de la API), -Contenedor (contenedor de Postgres), -Usuario, -Db, -SinEsperaCierre.
 Con el compose de infra/ (recomendado):
     .\probar-todo.ps1 -Contenedor postgres-quickgo -Usuario quickgo -Db quickgo
 Nota: la funcion Psql detecta automaticamente docker/podman (nativo o via WSL).
 Cada ejecucion crea empresas nuevas con datos unicos, asi que se puede repetir sin reiniciar la base.
#>
param(
    [string]$Base = "http://localhost:5010",
    [string]$Contenedor = "postgres-quickgo",
    [string]$Usuario = "quickgo",
    [string]$Db = "quickgo",
    [switch]$SinEsperaCierre
)

Add-Type -AssemblyName System.Net.Http
$ErrorActionPreference = "Continue"
$http = [System.Net.Http.HttpClient]::new()
$script:pass = 0; $script:fail = 0; $script:fallos = @()
$Clave = "Secreta123"
$s = "{0:D6}" -f (Get-Random -Maximum 999999)

function Seccion($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Cyan }

function Registrar($ok, $nombre, $detalle) {
    if ($ok) { $script:pass++; Write-Host ("  PASS  " + $nombre) -ForegroundColor Green }
    else { $d = [string]$detalle; if ($d.Length -gt 230) { $d = $d.Substring(0, 230) + "..." }; $script:fail++; $script:fallos += ($nombre + "  ->  " + $d); Write-Host ("  FAIL  " + $nombre + "  ->  " + $d) -ForegroundColor Red }
}

# Llama a la API. $Esperado = lista de codigos HTTP aceptados.
function T {
    param([string]$Nombre, [string]$Metodo, [string]$Ruta, $Cuerpo = $null, [string]$Token = $null, [int[]]$Esperado = @(200))
    $req = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::new($Metodo), ($Base + $Ruta))
    if ($Token) { $req.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $Token) }
    if ($null -ne $Cuerpo) {
        $json = $Cuerpo | ConvertTo-Json -Depth 8
        $req.Content = [System.Net.Http.StringContent]::new($json, [System.Text.Encoding]::UTF8, "application/json")
    }
    $status = 0; $texto = ""
    try {
        $resp = $http.SendAsync($req).GetAwaiter().GetResult()
        $status = [int]$resp.StatusCode
        $texto = $resp.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    } catch { $texto = $_.Exception.Message }
    $obj = $null
    if ($texto) { try { $obj = $texto | ConvertFrom-Json } catch { } }
    $ok = $Esperado -contains $status
    $det = "esperaba " + ($Esperado -join "/") + " y devolvio " + $status
    if (-not $ok -and $texto) { $det += " :: " + $texto.Substring(0, [Math]::Min(180, $texto.Length)) }
    Registrar $ok $Nombre $det
    return [pscustomobject]@{ Status = $status; Body = $obj; Texto = $texto }
}

function Verificar($Nombre, $Condicion, $Detalle = "la condicion no se cumplio") { Registrar ([bool]$Condicion) $Nombre $Detalle }
function Cuenta($o) { if ($null -eq $o) { 0 } else { @($o).Count } }
function Dia($n) { (Get-Date).AddDays($n).ToString("yyyy-MM-dd") }
function Iso($d) { (Get-Date).ToUniversalTime().AddDays($d).ToString("yyyy-MM-ddTHH:mm:ssZ") }
function Psql($sql) {
    $engines = @(
        @{ Cmd = "docker"; Args = @("exec", "-i", $Contenedor, "psql", "-U", $Usuario, "-d", $Db, "-v", "ON_ERROR_STOP=1") },
        @{ Cmd = "podman"; Args = @("exec", "-i", $Contenedor, "psql", "-U", $Usuario, "-d", $Db, "-v", "ON_ERROR_STOP=1") },
        @{ Cmd = "wsl";    Args = @("docker", "exec", "-i", $Contenedor, "psql", "-U", $Usuario, "-d", $Db, "-v", "ON_ERROR_STOP=1") },
        @{ Cmd = "wsl";    Args = @("podman", "exec", "-i", $Contenedor, "psql", "-U", $Usuario, "-d", $Db, "-v", "ON_ERROR_STOP=1") }
    )
    foreach ($e in $engines) {
        if (-not (Get-Command $e.Cmd -ErrorAction SilentlyContinue)) { continue }
        $prev = $ErrorActionPreference; $ErrorActionPreference = "Continue"
        $out = $sql | & $e.Cmd @($e.Args) 2>&1
        $code = $LASTEXITCODE
        $ErrorActionPreference = $prev
        if ($code -eq 0) { $global:LASTEXITCODE = 0; return $out }
    }
    $global:LASTEXITCODE = 1
    return "No se pudo ejecutar psql en el contenedor '$Contenedor'. Verifica que Docker/Podman este corriendo y que el contenedor exista."
}

$rolAdmin = "a0000000-0000-0000-0000-000000000001"
$rolDesp  = "a0000000-0000-0000-0000-000000000002"
$rolContr = "a0000000-0000-0000-0000-000000000004"
$tipoCamion = "a23fa570-2f4b-4f85-80e9-042d0d315001"
$ciudadTegus = "33333333-0000-0000-0000-000000000001"
$ciudadSPS   = "33333333-0000-0000-0000-000000000002"

$emailA = "admin1.$s@transportes.hn"; $emailB = "admin.$s@otra.hn"
$emailC = "admin.$s@contratante.hn";  $emailD = "admin.$s@contratante2.hn"
$emailDesp = "desp.$s@transportes.hn"; $emailCond = "cond.$s@transportes.hn"

# ---------------------------------------------------------------
Seccion "PASO 0 - Datos base (monedas, Honduras, ciudades)"
$seed = @"
INSERT INTO monedas (codigo, nombre, simbolo) VALUES ('HNL','Lempira','L'),('USD','Dolar estadounidense','$') ON CONFLICT DO NOTHING;
INSERT INTO paises (id, nombre, codigo_iso) VALUES ('11111111-0000-0000-0000-000000000001','Honduras','HND') ON CONFLICT DO NOTHING;
INSERT INTO departamentos (id, pais_id, nombre) VALUES
 ('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Francisco Morazan'),
 ('22222222-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','Cortes') ON CONFLICT DO NOTHING;
INSERT INTO ciudades (id, departamento_id, nombre, codigo_postal) VALUES
 ('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','Tegucigalpa','11101'),
 ('33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002','San Pedro Sula','21101') ON CONFLICT DO NOTHING;
"@
$r = Psql $seed
Verificar "seed.sql aplicado (Postgres responde)" ($LASTEXITCODE -eq 0) ($r | Out-String)

# ---------------------------------------------------------------
Seccion "0. Salud"
$null = T "0.1 GET /health" GET "/health" $null $null @(200)

# ---------------------------------------------------------------
Seccion "1. B1-01 Registro de empresa e inicio de sesion"
$regA = T "1.1 Registrar Transportista A" POST "/api/empresas/registro" @{ nombreComercial="Transportes Honduras $s"; razonSocial="Transportes Honduras SA"; rtn="0801999A$s"; tipo="Transportista"; primerNombre="Ana"; primerApellido="Lopez"; email=$emailA; password=$Clave } $null @(200,201)
$null = T "1.2 RTN repetido -> 409" POST "/api/empresas/registro" @{ nombreComercial="Otra $s"; razonSocial="Otra SA"; rtn="0801999A$s"; tipo="Transportista"; primerNombre="X"; primerApellido="Y"; email="rep.$s@x.hn"; password=$Clave } $null @(409)
$null = T "1.3 Contrasena debil -> 400" POST "/api/empresas/registro" @{ nombreComercial="Debil $s"; razonSocial="Debil SA"; rtn="0801999D$s"; tipo="Transportista"; primerNombre="X"; primerApellido="Y"; email="debil.$s@x.hn"; password="soloLetras" } $null @(400)
$null = T "1.4 Tipo de empresa invalido -> 400" POST "/api/empresas/registro" @{ nombreComercial="Mala $s"; razonSocial="Mala SA"; rtn="0801999M$s"; tipo="Otro"; primerNombre="X"; primerApellido="Y"; email="mala.$s@x.hn"; password=$Clave } $null @(400)
$null = T "1.5 Registrar Contratante C" POST "/api/empresas/registro" @{ nombreComercial="Constructora Cima $s"; razonSocial="Cima SA"; rtn="0801999C$s"; tipo="Contratante"; primerNombre="Carlos"; primerApellido="Mejia"; email=$emailC; password=$Clave } $null @(200,201)
$null = T "1.6 Registrar Transportista B" POST "/api/empresas/registro" @{ nombreComercial="Fletes del Norte $s"; razonSocial="Fletes SA"; rtn="0801999B$s"; tipo="Transportista"; primerNombre="Beto"; primerApellido="Rivas"; email=$emailB; password=$Clave } $null @(200,201)
$null = T "1.7 Registrar Contratante D" POST "/api/empresas/registro" @{ nombreComercial="Inmobiliaria Sol $s"; razonSocial="Sol SA"; rtn="0801999E$s"; tipo="Contratante"; primerNombre="Dora"; primerApellido="Pineda"; email=$emailD; password=$Clave } $null @(200,201)

$lA = T "1.8 Login A (token, rol Admin)" POST "/api/auth/login" @{ email=$emailA; password=$Clave } $null @(200)
Verificar "1.8b login devuelve token y rol=Admin" ($lA.Body.token -and $lA.Body.rol -eq "Admin") ($lA.Texto)
$tA = $lA.Body.token
$lB = T "1.9 Login B" POST "/api/auth/login" @{ email=$emailB; password=$Clave } $null @(200); $tB = $lB.Body.token
$lC = T "1.10 Login C (Contratante)" POST "/api/auth/login" @{ email=$emailC; password=$Clave } $null @(200); $tC = $lC.Body.token
$lD = T "1.11 Login D (Contratante 2)" POST "/api/auth/login" @{ email=$emailD; password=$Clave } $null @(200); $tD = $lD.Body.token
$null = T "1.11b Admin de C crea un usuario con rol Contratante" POST "/api/usuarios" @{ primerNombre="Cora"; primerApellido="Lagos"; email="contr.$s@contratante.hn"; password=$Clave; rolId=$rolContr } $tC @(200,201)
$null = T "1.11c Admin de D crea un usuario con rol Contratante" POST "/api/usuarios" @{ primerNombre="Dario"; primerApellido="Vega"; email="contr.$s@contratante2.hn"; password=$Clave; rolId=$rolContr } $tD @(200,201)
$lC2 = T "1.11d Login usuario Contratante de C" POST "/api/auth/login" @{ email="contr.$s@contratante.hn"; password=$Clave } $null @(200); $tC2 = $lC2.Body.token
Verificar "1.11e el rol es Contratante" ($lC2.Body.rol -eq "Contratante") $lC2.Texto
$lD2 = T "1.11f Login usuario Contratante de D" POST "/api/auth/login" @{ email="contr.$s@contratante2.hn"; password=$Clave } $null @(200); $tD2 = $lD2.Body.token
$w1 = T "1.12 Contrasena incorrecta -> 401" POST "/api/auth/login" @{ email=$emailA; password="Incorrecta1" } $null @(401)
$w2 = T "1.13 Correo inexistente -> 401" POST "/api/auth/login" @{ email="noexiste.$s@x.hn"; password=$Clave } $null @(401)
Verificar "1.13b mismo mensaje para correo y contrasena" ($w1.Body.detail -eq $w2.Body.detail) ("detalles distintos: " + $w1.Body.detail + " / " + $w2.Body.detail)

# ---------------------------------------------------------------
Seccion "2. B1-02 Contexto de empresa y autorizacion por rol"
$null = T "2.1 Sin token -> 401" GET "/api/usuarios" $null $null @(401)
$uA = T "2.2 Admin A lista usuarios" GET "/api/usuarios" $null $tA @(200)
Verificar "2.2b A ve solo 1 usuario" ((Cuenta $uA.Body) -eq 1) $uA.Texto
$anaId = @($uA.Body)[0].id
$uB = T "2.3 Admin B lista usuarios" GET "/api/usuarios" $null $tB @(200)
Verificar "2.3b B ve solo 1 usuario (no ve a Ana)" ((Cuenta $uB.Body) -eq 1 -and @($uB.Body)[0].email -eq $emailB) $uB.Texto
$null = T "2.4 Usuario Contratante intenta listar usuarios -> 403" GET "/api/usuarios" $null $tC2 @(403)

# ---------------------------------------------------------------
Seccion "3. B1-03 Roles y usuarios"
$roles = T "3.1 Catalogo de roles" GET "/api/catalogos/roles" $null $tA @(200)
Verificar "3.1b hay 4 roles" ((Cuenta $roles.Body) -eq 4) $roles.Texto
$cd = T "3.2 Crear Despachador" POST "/api/usuarios" @{ primerNombre="Diego"; primerApellido="Cruz"; telefono="9999-0001"; email=$emailDesp; password=$Clave; rolId=$rolDesp } $tA @(200,201)
$despId = $cd.Body.id
$null = T "3.3 Email repetido -> 409" POST "/api/usuarios" @{ primerNombre="Otro"; primerApellido="Cruz"; email=$emailDesp; password=$Clave; rolId=$rolDesp } $tA @(409)
$null = T "3.4 Rol Contratante en Transportista -> 400" POST "/api/usuarios" @{ primerNombre="Mal"; primerApellido="Rol"; email="malrol.$s@transportes.hn"; password=$Clave; rolId=$rolContr } $tA @(400,409)
$null = T "3.5 Rol Despachador en Contratante -> 400" POST "/api/usuarios" @{ primerNombre="Mal"; primerApellido="Rol"; email="malrol.$s@contratante.hn"; password=$Clave; rolId=$rolDesp } $tC @(400,409)
$lDesp = T "3.6 Login Despachador" POST "/api/auth/login" @{ email=$emailDesp; password=$Clave } $null @(200); $tDesp = $lDesp.Body.token
$null = T "3.7 Despachador crea usuarios -> 403" POST "/api/usuarios" @{ primerNombre="No"; primerApellido="Puede"; email="nopuede.$s@x.hn"; password=$Clave; rolId=$rolDesp } $tDesp @(403)
$null = T "3.8 Editar Despachador" PUT "/api/usuarios/$despId" @{ primerNombre="Diego"; segundoNombre="Andres"; primerApellido="Cruz"; telefono="9999-0002"; rolId=$rolDesp } $tA @(200)
$null = T "3.9 B edita usuario de A -> 404" PUT "/api/usuarios/$despId" @{ primerNombre="X"; primerApellido="Y"; rolId=$rolDesp } $tB @(404)
$ct = T "3.10 Crear usuario temporal" POST "/api/usuarios" @{ primerNombre="Temp"; primerApellido="Usuario"; email="temp.$s@transportes.hn"; password=$Clave; rolId=$rolDesp } $tA @(200,201)
$tempId = $ct.Body.id
$null = T "3.11 Desactivar temporal" PATCH "/api/usuarios/$tempId/desactivar" $null $tA @(200,204)
$null = T "3.12 Desactivado no puede entrar -> 403" POST "/api/auth/login" @{ email="temp.$s@transportes.hn"; password=$Clave } $null @(403)
$null = T "3.13 Admin se desactiva a si mismo -> 400/409" PATCH "/api/usuarios/$anaId/desactivar" $null $tA @(400,409)

# ---------------------------------------------------------------
Seccion "4. B1-04 y B1-05 Conductores"
$c1 = T "4.1 Conductor interno" POST "/api/conductores" @{ primerNombre="Pedro"; primerApellido="Ramos"; telefono="9999-1111"; email=$emailCond; password=$Clave; tipoConductor="Interno"; licencia="LIC-0001"; venceLicencia=(Dia 365) } $tDesp @(200,201)
$cond1Id = $c1.Body.id
$c2 = T "4.2 Conductor externo (sin acceso)" POST "/api/conductores" @{ primerNombre="Luis"; primerApellido="Mendoza"; tipoConductor="Externo"; licencia="LIC-0002"; venceLicencia=(Dia 15) } $tDesp @(200,201)
$cond2Id = $c2.Body.id
Verificar "4.2b externo con tieneAcceso=false" ($c2.Body.tieneAcceso -eq $false) $c2.Texto
$null = T "4.3 Conductor con licencia vencida" POST "/api/conductores" @{ primerNombre="Sara"; primerApellido="Flores"; tipoConductor="Externo"; licencia="LIC-0003"; venceLicencia=(Dia -2) } $tDesp @(200,201)
$null = T "4.4 Licencia repetida -> 409" POST "/api/conductores" @{ primerNombre="Rep"; primerApellido="Etido"; tipoConductor="Externo"; licencia="LIC-0001"; venceLicencia=(Dia 100) } $tDesp @(409)
$null = T "4.5 Interno sin email/password -> 400" POST "/api/conductores" @{ primerNombre="Sin"; primerApellido="Acceso"; tipoConductor="Interno"; licencia="LIC-0004"; venceLicencia=(Dia 100) } $tDesp @(400)
$lc = T "4.6 Listar conductores" GET "/api/conductores" $null $tDesp @(200)
Verificar "4.6b hay 3 conductores" ((Cuenta $lc.Body) -eq 3) $lc.Texto
$lx = T "4.7 Filtrar por tipo Externo" GET "/api/conductores?tipoConductor=Externo" $null $tDesp @(200)
Verificar "4.7b hay 2 externos" ((Cuenta $lx.Body) -eq 2) $lx.Texto
$lv = T "4.8 Licencias por vencer (30 dias)" GET "/api/conductores/licencias-por-vencer?dias=30" $null $tDesp @(200)
Verificar "4.8b incluye 2 (una ya vencida marcada)" ((Cuenta $lv.Body) -eq 2 -and ([regex]::Matches($lv.Texto, '"vencida":true')).Count -eq 1) $lv.Texto
$null = T "4.9 Detalle de conductor" GET "/api/conductores/$cond1Id" $null $tDesp @(200)
$null = T "4.10 Editar conductor" PUT "/api/conductores/$cond1Id" @{ primerNombre="Pedro"; segundoNombre="Jose"; primerApellido="Ramos"; telefono="9999-2222"; licencia="LIC-0001"; venceLicencia=(Dia 400); estado="Activo" } $tDesp @(200)
$null = T "4.11 B consulta conductor de A -> 404" GET "/api/conductores/$cond1Id" $null $tB @(404)
$lCond = T "4.12 Login conductor interno" POST "/api/auth/login" @{ email=$emailCond; password=$Clave } $null @(200); $tCond = $lCond.Body.token
$own = T "4.13 Conductor lista: solo su perfil" GET "/api/conductores" $null $tCond @(200)
Verificar "4.13b ve solo 1 (el suyo)" ((Cuenta $own.Body) -eq 1) $own.Texto
$null = T "4.14 Conductor ve licencias por vencer -> 403" GET "/api/conductores/licencias-por-vencer" $null $tCond @(403)

# ---------------------------------------------------------------
Seccion "5. B3-01 Catalogos"
$pa = T "5.1 Paises" GET "/api/catalogos/paises" $null $tA @(200)
Verificar "5.1b incluye Honduras" ($pa.Texto -match "Honduras") $pa.Texto
$d = T "5.2 Departamentos de Honduras" GET "/api/catalogos/departamentos?paisId=11111111-0000-0000-0000-000000000001" $null $tA @(200)
Verificar "5.2b hay departamentos" ((Cuenta $d.Body) -ge 2) $d.Texto
$ci = T "5.3 Ciudades de Francisco Morazan" GET "/api/catalogos/ciudades?departamentoId=22222222-0000-0000-0000-000000000001" $null $tA @(200)
Verificar "5.3b hay ciudades" ((Cuenta $ci.Body) -ge 1) $ci.Texto
$m = T "5.4 Monedas" GET "/api/catalogos/monedas" $null $tA @(200)
Verificar "5.4b incluye HNL y USD" ((Cuenta $m.Body) -ge 2) $m.Texto

# ---------------------------------------------------------------
Seccion "6. B3-02 Clientes"
$cl = T "6.1 Crear cliente" POST "/api/clientes" @{ primerNombre="Marta"; primerApellido="Zelaya"; telefono="8888-1000"; email="marta.$s@cliente.hn"; tipoCliente="Particular" } $tDesp @(200,201)
$clienteId = $cl.Body.id
$null = T "6.2 Sin telefono -> 400" POST "/api/clientes" @{ primerNombre="Sin"; primerApellido="Telefono"; tipoCliente="Particular" } $tDesp @(400)
$null = T "6.3 Email invalido -> 400" POST "/api/clientes" @{ primerNombre="Mal"; primerApellido="Correo"; telefono="8888-2000"; email="no-es-correo"; tipoCliente="Empresa" } $tDesp @(400)
$null = T "6.4 Segundo cliente (empresa)" POST "/api/clientes" @{ primerNombre="Ferreteria"; primerApellido="Central"; telefono="8888-3000"; tipoCliente="Empresa" } $tDesp @(200,201)
$b1 = T "6.5 Buscar por nombre (MARTA)" GET "/api/clientes?buscar=MARTA" $null $tDesp @(200)
Verificar "6.5b encuentra 1" ((Cuenta $b1.Body) -eq 1) $b1.Texto
$b2 = T "6.6 Buscar por telefono" GET "/api/clientes?buscar=8888-3" $null $tDesp @(200)
Verificar "6.6b encuentra la Ferreteria" ((Cuenta $b2.Body) -eq 1) $b2.Texto
$null = T "6.7 Editar cliente" PUT "/api/clientes/$clienteId" @{ primerNombre="Marta"; segundoNombre="Elena"; primerApellido="Zelaya"; telefono="8888-1001"; email="marta.$s@cliente.hn"; tipoCliente="Particular" } $tDesp @(200)
$lb = T "6.8 B lista clientes (vacio)" GET "/api/clientes" $null $tB @(200)
Verificar "6.8b B no ve clientes de A" ((Cuenta $lb.Body) -eq 0) $lb.Texto
$null = T "6.9 B edita cliente de A -> 404" PUT "/api/clientes/$clienteId" @{ primerNombre="X"; primerApellido="Y"; telefono="1"; tipoCliente="Particular" } $tB @(404)

# ---------------------------------------------------------------
Seccion "7. B3-03 Direcciones"
$da1 = T "7.1 Direccion origen de A" POST "/api/direcciones" @{ clienteId=$clienteId; ciudadId=$ciudadTegus; callePrincipal="Blvd Morazan"; numeroExterior="100"; coloniaSector="Palmira"; referencia="Frente al banco"; lat=14.0818; lng=-87.2068 } $tDesp @(200,201)
$dirA1 = $da1.Body.id
$da2 = T "7.2 Direccion destino de A" POST "/api/direcciones" @{ ciudadId=$ciudadSPS; callePrincipal="3a Avenida"; coloniaSector="Centro"; lat=15.5042; lng=-88.0250 } $tDesp @(200,201)
$dirA2 = $da2.Body.id
$null = T "7.3 Latitud fuera de rango -> 400" POST "/api/direcciones" @{ ciudadId=$ciudadTegus; callePrincipal="Calle X"; lat=95; lng=-87 } $tDesp @(400)
$null = T "7.4 Sin coordenadas -> 400" POST "/api/direcciones" @{ ciudadId=$ciudadTegus; callePrincipal="Sin coordenadas" } $tDesp @(400)
$null = T "7.5 clienteId de otra empresa -> 400/404" POST "/api/direcciones" @{ clienteId=$clienteId; ciudadId=$ciudadTegus; callePrincipal="Calle"; lat=14.0; lng=-87.0 } $tB @(400,404)
$ld = T "7.6 Listar direcciones de A" GET "/api/direcciones" $null $tDesp @(200)
Verificar "7.6b hay 2" ((Cuenta $ld.Body) -eq 2) $ld.Texto
$lf = T "7.7 Filtrar por cliente" GET "/api/direcciones?clienteId=$clienteId" $null $tDesp @(200)
Verificar "7.7b hay 1" ((Cuenta $lf.Body) -eq 1) $lf.Texto
$null = T "7.8 Editar direccion" PUT "/api/direcciones/$dirA2" @{ ciudadId=$ciudadSPS; callePrincipal="3a Avenida Norte"; coloniaSector="Centro"; lat=15.5042; lng=-88.0250 } $tDesp @(200)
$null = T "7.9 B edita direccion de A -> 404" PUT "/api/direcciones/$dirA2" @{ ciudadId=$ciudadSPS; callePrincipal="X"; lat=15.0; lng=-88.0 } $tB @(404)
$dc1 = T "7.10 Contratante C crea direccion origen" POST "/api/direcciones" @{ ciudadId=$ciudadTegus; callePrincipal="Col Kennedy bodega 5"; lat=14.1; lng=-87.2 } $tC @(200,201); $dirC1 = $dc1.Body.id
$dc2 = T "7.11 Contratante C crea direccion destino" POST "/api/direcciones" @{ ciudadId=$ciudadSPS; callePrincipal="Obra Torre Norte"; lat=15.5; lng=-88.0 } $tC @(200,201); $dirC2 = $dc2.Body.id

# ---------------------------------------------------------------
Seccion "8. B2-01 a B2-04 Flota, documentos y asignaciones"
$tv = T "8.1 Tipos de vehiculo" GET "/api/catalogos/tipos-vehiculo" $null $tDesp @(200)
Verificar "8.1b hay al menos 1 tipo" ((Cuenta $tv.Body) -ge 1) $tv.Texto
$v1 = T "8.2 Crear vehiculo 1" POST "/api/vehiculos" @{ tipoVehiculoId=$tipoCamion; placa="HAB-1001"; vin="VIN0000000000001"; propiedad="Propio" } $tDesp @(200,201); $veh1 = $v1.Body.id
Verificar "8.2b nace sin seguro vigente" ($v1.Body.seguroVigente -eq $false) $v1.Texto
$v2 = T "8.3 Crear vehiculo 2" POST "/api/vehiculos" @{ tipoVehiculoId=$tipoCamion; placa="HAB-1002"; propiedad="Externo" } $tDesp @(200,201); $veh2 = $v2.Body.id
$null = T "8.4 Placa repetida -> 409" POST "/api/vehiculos" @{ tipoVehiculoId=$tipoCamion; placa="HAB-1001"; propiedad="Propio" } $tDesp @(409)
$null = T "8.5 Tipo inexistente -> 400/404" POST "/api/vehiculos" @{ tipoVehiculoId="00000000-0000-0000-0000-000000000000"; placa="HAB-9999"; propiedad="Propio" } $tDesp @(400,404)
$null = T "8.6 B usa la misma placa en su empresa" POST "/api/vehiculos" @{ tipoVehiculoId=$tipoCamion; placa="HAB-1001"; propiedad="Propio" } $tB @(200,201)
$lv1 = T "8.7 Listar vehiculos de A" GET "/api/vehiculos" $null $tDesp @(200)
Verificar "8.7b hay 2" ((Cuenta $lv1.Body) -eq 2) $lv1.Texto
$null = T "8.8 Filtrar por estado Disponible" GET "/api/vehiculos?estado=Disponible" $null $tDesp @(200)
$null = T "8.9 Detalle vehiculo 1" GET "/api/vehiculos/$veh1" $null $tDesp @(200)
$null = T "8.10 B pide vehiculo de A -> 404" GET "/api/vehiculos/$veh1" $null $tB @(404)
$null = T "8.11 Vehiculo 2 a Mantenimiento" PUT "/api/vehiculos/$veh2" @{ estado="Mantenimiento"; vin="VIN0000000000002" } $tDesp @(200)
$null = T "8.12 Vehiculo 2 a Disponible" PUT "/api/vehiculos/$veh2" @{ estado="Disponible" } $tDesp @(200)

$null = T "8.13 Seguro vigente al vehiculo 1 (Admin)" POST "/api/vehiculos/$veh1/documentos" @{ tipo="Seguro"; numero="SEG-001"; fechaVencimiento=(Dia 365) } $tA @(200,201)
$null = T "8.14 Revision que vence en 10 dias" POST "/api/vehiculos/$veh1/documentos" @{ tipo="Revision"; numero="REV-001"; fechaVencimiento=(Dia 10) } $tA @(200,201)
$null = T "8.15 Revision ya vencida (vehiculo 2)" POST "/api/vehiculos/$veh2/documentos" @{ tipo="Revision"; numero="REV-002"; fechaVencimiento=(Dia -3) } $tA @(200,201)
$null = T "8.15b Seguro vigente al vehiculo 2" POST "/api/vehiculos/$veh2/documentos" @{ tipo="Seguro"; numero="SEG-002"; fechaVencimiento=(Dia 365) } $tA @(200,201)
$null = T "8.16 Despachador crea documento -> 403" POST "/api/vehiculos/$veh1/documentos" @{ tipo="Seguro"; numero="X"; fechaVencimiento=(Dia 30) } $tDesp @(403)
$null = T "8.17 B crea documento en vehiculo de A -> 404" POST "/api/vehiculos/$veh1/documentos" @{ tipo="Seguro"; numero="X"; fechaVencimiento=(Dia 30) } $tB @(404)
$dl = T "8.18 Listar documentos del vehiculo 1" GET "/api/vehiculos/$veh1/documentos" $null $tDesp @(200)
Verificar "8.18b hay 2" ((Cuenta $dl.Body) -eq 2) $dl.Texto
$vv = T "8.19 Vehiculo 1 con seguro vigente" GET "/api/vehiculos/$veh1" $null $tDesp @(200)
Verificar "8.19b seguroVigente=true" ($vv.Body.seguroVigente -eq $true) $vv.Texto
$pv = T "8.20 Documentos por vencer (30 dias)" GET "/api/documentos/por-vencer?dias=30" $null $tDesp @(200)
Verificar "8.20b trae 2 (REV-001 y REV-002 vencida)" ((Cuenta $pv.Body) -eq 2 -and ([regex]::Matches($pv.Texto, '"vencido":true')).Count -eq 1) $pv.Texto

$as1 = T "8.21 Asignar vehiculo 1 al conductor interno" POST "/api/asignaciones" @{ vehiculoId=$veh1; conductorId=$cond1Id } $tDesp @(200,201)
Verificar "8.21b nace vigente" ($as1.Body.vigente -eq $true) $as1.Texto
$as2 = T "8.22 Reasignar vehiculo 1 al conductor externo" POST "/api/asignaciones" @{ vehiculoId=$veh1; conductorId=$cond2Id } $tDesp @(200,201); $asig2 = $as2.Body.id
$hist = T "8.23 Historial del vehiculo 1" GET "/api/vehiculos/$veh1/asignaciones" $null $tDesp @(200)
Verificar "8.23b 2 filas y solo 1 vigente" ((Cuenta $hist.Body) -eq 2 -and ([regex]::Matches($hist.Texto, '"vigente":true')).Count -eq 1) $hist.Texto
$null = T "8.24 Historial del conductor (B2-04)" GET "/api/conductores/$cond1Id/asignaciones" $null $tDesp @(200)
$null = T "8.25 Finalizar asignacion vigente" PATCH "/api/asignaciones/$asig2/finalizar" $null $tDesp @(200,204)
$null = T "8.26 Finalizarla otra vez -> error" PATCH "/api/asignaciones/$asig2/finalizar" $null $tDesp @(400,404,409)
$null = T "8.27 B asigna vehiculo de A -> 400/404" POST "/api/asignaciones" @{ vehiculoId=$veh1; conductorId=$cond1Id } $tB @(400,404)
$null = T "8.28 Conductor externo a Inactivo" PUT "/api/conductores/$cond2Id" @{ primerNombre="Luis"; primerApellido="Mendoza"; licencia="LIC-0002"; venceLicencia=(Dia 15); estado="Inactivo" } $tDesp @(200)
$null = T "8.29 Asignar conductor Inactivo -> error" POST "/api/asignaciones" @{ vehiculoId=$veh2; conductorId=$cond2Id } $tDesp @(400,409)
$null = T "8.30 Conductor externo de nuevo Activo" PUT "/api/conductores/$cond2Id" @{ primerNombre="Luis"; primerApellido="Mendoza"; licencia="LIC-0002"; venceLicencia=(Dia 15); estado="Activo" } $tDesp @(200)
$null = T "8.31 Dejar asignacion vigente (vehiculo 1 al interno)" POST "/api/asignaciones" @{ vehiculoId=$veh1; conductorId=$cond1Id } $tDesp @(200,201)

# ---------------------------------------------------------------
Seccion "9. B4-01 a B4-05 Envios, cotizaciones y seguimiento"
$envBody = @{ clienteId=$clienteId; origenDireccionId=$dirA1; destinoDireccionId=$dirA2; tipoServicio="Carga"; fechaProgramada=(Iso 2); pesoKg=1000; volumenM3=5; tarifa=5000 }
$e1 = T "9.1 Crear envio" POST "/api/envios" $envBody $tDesp @(200,201); $env1 = $e1.Body.id
Verificar "9.1b estado Pendiente" ($e1.Body.estado -eq "Pendiente") $e1.Texto
$eBad = $envBody.Clone(); $eBad.origenDireccionId = $dirA1; $eBad.destinoDireccionId = $dirA1
$null = T "9.2 Origen igual destino -> 400" POST "/api/envios" $eBad $tDesp @(400)
$eBad2 = $envBody.Clone(); $eBad2.fechaProgramada = (Iso -1)
$null = T "9.3 Fecha pasada -> 400" POST "/api/envios" $eBad2 $tDesp @(400)
$eList = T "9.4 Listar envios" GET "/api/envios" $null $tDesp @(200)
Verificar "9.4b hay 1" ((Cuenta $eList.Body) -ge 1) $eList.Texto
$eDet = T "9.5 Detalle envio" GET "/api/envios/$env1" $null $tDesp @(200)
Verificar "9.5b incluye margen" ($null -ne $eDet.Body.margen) $eDet.Texto
$eUp = $envBody.Clone(); $eUp.tarifa = 6000
$eu = T "9.6 Editar envio pendiente" PUT "/api/envios/$env1" $eUp $tDesp @(200)
Verificar "9.6b tarifa actualizada" ($eu.Body.tarifa -eq 6000) $eu.Texto
$null = T "9.7 B ve envio de A -> 404" GET "/api/envios/$env1" $null $tB @(404)

# asignacion de vehiculo/conductor para envio (usar veh2, cond1)
$asigEnv = T "9.8 Asignar envio" PATCH "/api/envios/$env1/asignar" @{ vehiculoId=$veh2; conductorId=$cond1Id; costoExterno=1000 } $tDesp @(200)
Verificar "9.8b estado Asignado" ($asigEnv.Body.estado -eq "Asignado") $asigEnv.Texto
$null = T "9.9 Editar envio ya asignado -> 409" PUT "/api/envios/$env1" $eUp $tDesp @(409)

# cotizaciones
$cot = T "9.10 Crear cotizacion" POST "/api/envios/$env1/cotizaciones" @{ monto=5500; monedaCodigo="HNL"; validaHasta=(Iso 5) } $tDesp @(200,201); $cotId = $cot.Body.id
$cotList = T "9.11 Listar cotizaciones" GET "/api/envios/$env1/cotizaciones" $null $tDesp @(200)
Verificar "9.11b hay 1" ((Cuenta $cotList.Body) -ge 1) $cotList.Texto
$cotAcc = T "9.12 Aceptar cotizacion" PATCH "/api/envios/$env1/cotizaciones/$cotId/aceptar" $null $tDesp @(200)
Verificar "9.12b aceptada" ($cotAcc.Body.aceptada -eq $true) $cotAcc.Texto

# cambio de estado por conductor
$est1 = T "9.13 Conductor marca EnCurso" PATCH "/api/envios/$env1/estado" @{ estado="EnCurso" } $tCond @(200)
Verificar "9.13b EnCurso" ($est1.Body.estado -eq "EnCurso") $est1.Texto
$seg1 = T "9.14 Registrar seguimiento" POST "/api/envios/$env1/seguimiento" @{ lat=14.1; lng=-87.2; estado="En ruta" } $tCond @(200,201)
$segList = T "9.15 Listar seguimiento" GET "/api/envios/$env1/seguimiento" $null $tDesp @(200)
Verificar "9.15b hay seguimiento" ((Cuenta $segList.Body) -ge 1) $segList.Texto
$segUlt = T "9.16 Ultimo seguimiento" GET "/api/envios/$env1/seguimiento/ultimo" $null $tDesp @(200)
Verificar "9.16b ultimo" ($segUlt.Body.estado -eq "En ruta") $segUlt.Texto
$est2 = T "9.17 Conductor marca Completado" PATCH "/api/envios/$env1/estado" @{ estado="Completado" } $tCond @(200)
Verificar "9.17b Completado" ($est2.Body.estado -eq "Completado") $est2.Texto

# cancelar envio pendiente
$env2 = T "9.18 Crear envio para cancelar" POST "/api/envios" $envBody $tDesp @(200,201); $env2Id = $env2.Body.id
$can = T "9.19 Cancelar envio pendiente" PATCH "/api/envios/$env2Id/cancelar" $null $tDesp @(200)
Verificar "9.19b Cancelado" ($can.Body.estado -eq "Cancelado") $can.Texto

# ---------------------------------------------------------------
Seccion "10. B3-04 Facturas y pagos (sobre envio Completado via API)"
$f = T "10.1 Facturar envio Completado (tarifa aceptada)" POST "/api/facturas" @{ envioId=$env1; monedaCodigo="USD" } $tA @(200,201)
$facId = $f.Body.id
Verificar "10.1b factura creada" ($facId -ne $null) $f.Texto
$null = T "10.2 Facturar el mismo envio -> 409" POST "/api/facturas" @{ envioId=$env1 } $tA @(409)
$envPend = T "10.3 Crear envio pendiente para factura" POST "/api/envios" $envBody $tDesp @(200,201); $envPendId = $envPend.Body.id
$null = T "10.4 Facturar envio Pendiente -> 409" POST "/api/facturas" @{ envioId=$envPendId } $tA @(409)
$null = T "10.5 B factura envio de A -> 404" POST "/api/facturas" @{ envioId=$env1 } $tB @(404)
$null = T "10.6 Despachador crea factura -> 403" POST "/api/facturas" @{ envioId=$env1 } $tDesp @(403)
$null = T "10.7 Despachador consulta facturas" GET "/api/facturas" $null $tDesp @(200)
$fd = T "10.8 Detalle de la factura" GET "/api/facturas/$facId" $null $tA @(200)
$montoFac = [decimal]$fd.Body.monto
$pago1Monto = [math]::Floor($montoFac/2)
$resto = $montoFac - $pago1Monto
$p1 = T "10.9 Pago parcial" POST "/api/facturas/$facId/pagos" @{ metodo="Efectivo"; monto=$pago1Monto } $tA @(200,201)
Verificar "10.9b saldo restante" ([decimal]$p1.Body.saldoRestante -eq $resto) $p1.Texto
$null = T "10.10 Pago mayor al saldo -> error" POST "/api/facturas/$facId/pagos" @{ metodo="Transferencia"; monto=($resto+1000) } $tA @(400,409)
$p2 = T "10.11 Pago final" POST "/api/facturas/$facId/pagos" @{ metodo="Transferencia"; monto=$resto } $tA @(200,201)
Verificar "10.11b factura Pagada" ($p2.Body.estadoFactura -eq "Pagada") $p2.Texto
$null = T "10.12 Pagar factura ya Pagada -> 409" POST "/api/facturas/$facId/pagos" @{ metodo="Efectivo"; monto=1 } $tA @(400,409)
$null = T "10.13 B consulta factura de A -> 404" GET "/api/facturas/$facId" $null $tB @(404)

# ---------------------------------------------------------------
Seccion "11. B5-01 a B5-05 Subastas, pujas y adjudicacion"
$sub = @{ tipoVehiculoId=$tipoCamion; origenDireccionId=$dirC1; destinoDireccionId=$dirC2; descripcion="20 toneladas de cemento"; pesoKg=20000; volumenM3=15; precioMaximo=25000; monedaCodigo="HNL"; fechaCierre=(Iso 30) }
$sc = T "11.1 Publicar subasta" POST "/api/subastas" $sub $tC2 @(200,201); $subId = $sc.Body.id
Verificar "11.1b estado Abierta" ($sc.Body.estado -eq "Abierta") $sc.Texto
$null = T "11.2 Transportista publica -> 403" POST "/api/subastas" $sub $tA @(403)
$mi = T "11.3 Mis subastas" GET "/api/subastas/mias" $null $tC2 @(200)
Verificar "11.3b hay >=1" ((Cuenta $mi.Body) -ge 1) $mi.Texto
$sd = T "11.4 Detalle de la subasta" GET "/api/subastas/$subId" $null $tC2 @(200)
$null = T "11.5 D pide subasta de C -> 404" GET "/api/subastas/$subId" $null $tD2 @(404)

# B5-03 pujar
$ab = T "11.6 Listar subastas abiertas (A)" GET "/api/subastas/abiertas" $null $tDesp @(200)
Verificar "11.6b contiene subasta" (($ab.Texto -match $subId)) $ab.Texto
$pu1 = T "11.7 Pujar A" POST "/api/subastas/$subId/pujas" @{ conductorId=$cond1Id; monto=20000; mensaje="Oferta A" } $tDesp @(200,201); $pujaA = $pu1.Body.id
$null = T "11.8 Pujar otra vez misma empresa -> 409" POST "/api/subastas/$subId/pujas" @{ conductorId=$cond1Id; monto=19000 } $tDesp @(409)
$null = T "11.9 Monto mayor a maximo -> 400" POST "/api/subastas/$subId/pujas" @{ conductorId=$cond1Id; monto=30000 } $tB @(400)

# Crear conductor en empresa B para pujar (B tiene vehiculo tipo camion? crear vehiculo tipo camion y conductor)
$tipoCamionId = $tipoCamion
$vB = T "11.10 B crea vehiculo camion" POST "/api/vehiculos" @{ tipoVehiculoId=$tipoCamionId; placa="BBB-$s"; vin="VINB$s"; propiedad="Propio" } $tB @(200,201); $vehB=$vB.Body.id
$docB = T "11.11 B documento seguro" POST "/api/vehiculos/$vehB/documentos" @{ tipo="Seguro"; numero="SEG-B-$s"; fechaVencimiento=(Dia 180) } $tB @(200,201)
$condB = T "11.12 B crea conductor interno" POST "/api/conductores" @{ primerNombre="Beto"; primerApellido="Cond"; email="condb.$s@otra.hn"; password=$Clave; tipoConductor="Interno"; licencia="LIC-B-$s"; venceLicencia=(Dia 180) } $tB @(200,201); $condBId=$condB.Body.id
$pu2 = T "11.13 Pujar B" POST "/api/subastas/$subId/pujas" @{ conductorId=$condBId; monto=18000; mensaje="Oferta B" } $tB @(200,201); $pujaB=$pu2.Body.id

# B5-04 mejor oferta y pujas
$mo = T "11.14 Mejor oferta" GET "/api/subastas/$subId/mejor-oferta" $null $tDesp @(200)
Verificar "11.14b monto 18000" ([decimal]$mo.Body.monto -eq 18000) $mo.Texto
$pujasC = T "11.15 Contratante ve pujas" GET "/api/subastas/$subId/pujas" $null $tC2 @(200)
Verificar "11.15b hay 2" ((Cuenta $pujasC.Body) -eq 2) $pujasC.Texto
$null = T "11.16 D ve pujas de subasta ajena -> 404" GET "/api/subastas/$subId/pujas" $null $tD2 @(404)
$null = T "11.17 Retirar puja A" DELETE "/api/subastas/$subId/pujas/mia" $null $tDesp @(200,204)
$mo2 = T "11.18 Mejor oferta tras retiro" GET "/api/subastas/$subId/mejor-oferta" $null $tDesp @(200)
Verificar "11.18b sigue 18000 (de B)" ([decimal]$mo2.Body.monto -eq 18000) $mo2.Texto

# B5-05 adjudicar
$adj = T "11.19 Adjudicar a puja B" PATCH "/api/subastas/$subId/adjudicar" @{ pujaId=$pujaB } $tC2 @(200)
Verificar "11.19b estado Adjudicada" ($adj.Body.estado -eq "Adjudicada") $adj.Texto
$null = T "11.20 Adjudicar otra vez -> 409" PATCH "/api/subastas/$subId/adjudicar" @{ pujaId=$pujaB } $tC2 @(409)

# cierre automatico
$sh = $sub.Clone(); $sh.fechaCierre = (Get-Date).ToUniversalTime().AddSeconds(45).ToString("yyyy-MM-ddTHH:mm:ssZ")
$sk = T "11.21 Subasta que cierra en 45 segundos" POST "/api/subastas" $sh $tC2 @(200,201); $subCorta = $sk.Body.id
if (-not $SinEsperaCierre) {
    Write-Host "  ... esperando 50 segundos para probar el cierre automatico ..." -ForegroundColor Yellow
    Start-Sleep -Seconds 50
    $sv = T "11.22 Consultar tras el cierre" GET "/api/subastas/$subCorta" $null $tC2 @(200)
    Verificar "11.22b estado Vencida (cierre automatico)" ($sv.Body.estado -eq "Vencida") $sv.Texto
}

# ---------------------------------------------------------------
Write-Host ""
Write-Host "================ RESUMEN ================" -ForegroundColor Cyan
Write-Host ("PASS: " + $script:pass) -ForegroundColor Green
Write-Host ("FAIL: " + $script:fail) -ForegroundColor $(if ($script:fail -eq 0) { "Green" } else { "Red" })
if ($script:fallos.Count -gt 0) {
    Write-Host ""; Write-Host "Pruebas que fallaron:" -ForegroundColor Red
    $script:fallos | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor Red }
}
Write-Host ""
Write-Host "Pendientes (excluidas por indicacion): B2-05 Docker, B3-05 CI/CD." -ForegroundColor DarkYellow
