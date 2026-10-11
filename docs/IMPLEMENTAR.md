# Llevá ESMALTE de demo a sistema real

Esta guía te lleva de "lo clonaste y corre en tu compu" a "una clínica lo usa con datos reales". Es para principiantes: cada paso es un comando o un bloque que copiás y pegás.

> **Importante:** este repo es un **demo frontend** con datos de ejemplo. No trae backend ni dependencias de Supabase, Railway o IA. Esta guía **describe** cómo agregarlos en **tu copia**. Los bloques de código son ejemplos para pegar en tu proyecto, no archivos que ya existan acá.

> **Datos de salud:** las historias clínicas, los odontogramas y los teléfonos de pacientes reales son datos sensibles. Antes de cargar uno solo, leé el aviso de la sección 3.2 y el checklist de la sección 7. Esta guía **no es asesoramiento legal**.

---

## 0. Qué vas a lograr, en qué orden y cuánto tarda

Vas a reemplazar los `data.json` por una base de datos real con usuarios que inician sesión, agregar tareas automáticas (recordatorios de turno, recall de pacientes) y publicar todo en internet.

| Etapa | Qué hacés | Tiempo estimado |
|---|---|---|
| 1 | Clonar y correr local | 10-15 min |
| 2 | Entender qué archivo va con qué tabla | 10 min (lectura) |
| 3 | Supabase: base de datos, seguridad, login, conectar un módulo | 1-2 h |
| 4 | Railway: recordatorios y recall automáticos | 45-60 min |
| 5 | Vercel: publicar el sistema | 15-20 min |
| 6 | IA (opcional): sugerir respuestas en Mensajes | 30-45 min |
| 7 | Checklist de seguridad antes de usar datos reales | 20-30 min |

**Orden recomendado:** 1 → 2 → 3 → 5 → 7 → 4 → 6. Publicá primero con Supabase (etapas 3 y 5), revisá la seguridad (7) y recién después sumá los automatismos (4) y la IA (6). Los tiempos son para alguien que sigue la guía por primera vez.

---

## 1. Clonar y correr local

### 1.1 Qué necesitás instalado

1. **Node.js**, versión **LTS**. Descargalo en https://nodejs.org (para la etapa 4 necesitás Node 22.12 o mayor, así que elegí la LTS más nueva).
2. **Git**. Descargalo en https://git-scm.com

Verificá que quedaron instalados. Abrí una terminal y escribí:

```bash
node -v
git --version
```

Si cada comando devuelve un número de versión, está bien.

### 1.2 Clonar y correr

```bash
git clone https://github.com/jlucasacosta/sistema-clinica-dental.git
cd sistema-clinica-dental
npm install
npm run dev
```

Abrí http://localhost:3000. Tenés que ver el panel de ESMALTE con los turnos del día.

> Si vas a convertirlo en el sistema de **tu** cliente, hacé un fork o copiá la carpeta a un repositorio **tuyo y privado** antes de tocar nada. No subas datos reales a un repositorio público.

### 1.3 Tres errores típicos

| Qué ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| `node: command not found` o `npm: command not found` | Node no está instalado, o abriste la terminal antes de instalarlo | Instalá Node (1.1), **cerrá la terminal y abrí una nueva**, volvé a probar `node -v` |
| `Port 3000 is in use` | Ya hay otro programa usando el puerto 3000 | `npm run dev -- -p 3001` y abrí http://localhost:3001 |
| `Cannot find module 'next'` o `'next' is not recognized` | Te saltaste `npm install`, o estás parado en otra carpeta | `cd sistema-clinica-dental` y después `npm install` |

---

## 2. Mapa de este sistema

Cada módulo tiene un `api.ts` (las funciones que la pantalla llama) y un `data.json` (los datos de ejemplo). **Conectar el backend es cambiar el cuerpo de esas funciones; la firma (nombre, parámetros y tipo de lo que devuelve) no se toca.** Así las pantallas no se enteran del cambio.

| Módulo (carpeta) | Pantalla | Funciones de `api.ts` | Claves de `data.json` | Tablas sugeridas |
|---|---|---|---|---|
| `modules/dashboard` | Panel | `getJornada`, `getProduccion`, `getProximos`, `getRecall`, `getOcupacion` | `jornada`, `produccion`, `proximos`, `recall`, `ocupacion` | `turnos` (jornada, próximos y ocupación se **calculan**), `tratamientos` (producción), `seguimientos` + `pacientes` (recall) |
| `modules/agenda` | Agenda | `getSillones`, `getDentistas`, `getTurnosDia(fecha)` | `sillones`, `dentistas`, `turnos` | `sillones`, `profesionales`, `turnos` |
| `modules/ordenes` | Fichas | `getFichas`, `getFicha(id)` (y `piezasEnVisita`, que es una función pura del navegador: se queda como está) | `fichas` (cada una con `visitas` y cada visita con `lesiones`) | `fichas`, `visitas`, `lesiones` |
| `modules/contactos` | Pacientes | `getPacientes` | `pacientes` | `pacientes` (+ vista `pacientes_v`) |
| `modules/conversaciones` | Mensajes | `getHilos` | `hilos` (cada uno con `mensajes`) | `hilos`, `mensajes` |
| `modules/config` | Configuración | (no tiene `api.ts`: lee `shell/theme.ts`) | (ninguna) | `ajustes` (una fila con un `jsonb`) |

Cosas del dominio dental que conviene saber antes de crear tablas:

- **El odontograma no se guarda como foto de las 32 piezas.** Es la **suma de las lesiones** de todas las visitas hasta una fecha. Por eso hay una tabla `lesiones` ligada a `visitas`. Cada visita agrega lesiones y la boca en una fecha se reconstruye sumando (eso hace `piezasEnVisita`).
- **Los minutos de montaje y esterilización no se guardan por turno.** Salen de `theme.ciclo` (10 y 20 minutos hoy). La base solo guarda inicio y duración de la atención.
- **`edad`, `diasDesdeVisita` y `diasSinSesion` se calculan**, no se guardan.
- **Las claves del `data.json` están en `camelCase` y las columnas SQL van en `snake_case`.** El `api.ts` es el traductor.

---

## 3. Supabase: base de datos y login

### 3.1 Crear el proyecto

1. Entrá a https://supabase.com y creá una cuenta.
2. **New project**. Elegí un nombre (por ejemplo `esmalte-clinica-nombre`), una región cercana a tu cliente y una **contraseña de base de datos fuerte**. Guardala en un gestor de contraseñas. **No la pegues en el repositorio.**
3. Esperá a que el proyecto termine de crearse (un par de minutos).

**Recomendación para clínicas:** un proyecto de Supabase **por clínica**. Los datos de cada cliente quedan aislados y las reglas de seguridad de esta guía son más simples. Si más adelante necesitás varias clínicas en una misma base, agregá una columna `clinica_id` a cada tabla y una policy por pertenencia a la clínica (el patrón de funciones `security definer` de la sección 3.3 sirve igual).

### 3.2 Aviso de privacidad (leelo antes de cargar pacientes)

- Este demo usa **solamente datos ficticios**. Nombres, teléfonos, mails y fichas son inventados.
- Con **pacientes reales** manejás **datos de salud**. En la mayoría de los países hay normativa específica de protección de datos personales y de historia clínica. Antes de usar el sistema con datos reales consultá con un profesional del derecho de tu país y con el cliente.
- Como mínimo, el sistema tiene que tener: **acceso restringido por rol y por profesional (RLS estricta)**, **cifrado** en tránsito (HTTPS) y en reposo, **consentimiento** del paciente para tratar sus datos, **registro de quién accedió y modificó** qué, **copias de seguridad** y un plan para pedidos de acceso o borrado.
- La historia clínica es un registro médico-legal: **las correcciones se hacen agregando una visita nueva, no editando ni borrando la anterior**. El SQL de esta guía lo aplica (la tabla `visitas` y la tabla `lesiones` no tienen policies de `update` ni de `delete`).
- No mandes datos de pacientes por canales no cifrados ni a servicios de IA sin revisar sus condiciones (sección 6).

### 3.3 Crear las tablas (SQL)

En el panel de Supabase abrí **SQL Editor** → **New query**, pegá cada bloque y apretá **Run**. Hacelo **en orden**. Los nombres de columna salen de los tipos reales de cada `api.ts` y de las claves reales de cada `data.json`.

**Bloque A: extensión, catálogos y perfiles**

```sql
-- btree_gist permite que la restriccion anti-solapamiento de turnos mezcle "=" y rangos.
create extension if not exists btree_gist with schema extensions;

-- agenda: sillones y profesionales (data.json de agenda: sillones, dentistas)
create table public.sillones (
  id     text primary key,          -- 'S1'
  nombre text not null              -- 'Sillon 1'
);

create table public.profesionales (
  id     text primary key,          -- 'D1'
  nombre text not null              -- 'Dra. Ferrante'
);

-- Quien puede entrar y con que rol. Un usuario de Supabase Auth = una fila aca.
create table public.perfiles (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  rol            text not null check (rol in ('admin', 'recepcion', 'profesional')),
  profesional_id text references public.profesionales (id)  -- solo si rol = 'profesional'
);
```

**Bloque B: pacientes, fichas, visitas y lesiones**

```sql
-- contactos: Paciente { id, nombre, edad, email, telefono, obraSocial, estadoOS, ultimaVisita, diasDesdeVisita, alertas }
-- edad y diasDesdeVisita se calculan (vista pacientes_v); alertas es la lista de textos de la ficha.
create table public.pacientes (
  id               text primary key,                  -- 'P-01'
  nombre           text not null,
  fecha_nacimiento date not null,
  email            text,
  telefono         text,
  obra_social      text not null default 'Particular',
  estado_os        text not null
                   check (estado_os in ('aprobada', 'en tramite', 'rechazada', 'particular')),
  ultima_visita    date,
  alertas          text[] not null default '{}',      -- 'Alergia a penicilina', 'Embarazo 2do trimestre'
  creado_en        timestamptz not null default now()
);

-- ordenes: Ficha { id, paciente..., alertas, plan { nombre, sesionesHechas, sesionesTotales }, visitas }
create table public.fichas (
  id                   text primary key,              -- 'F-1042'
  paciente_id          text not null references public.pacientes (id),
  plan_nombre          text,
  plan_sesiones_hechas integer not null default 0 check (plan_sesiones_hechas >= 0),
  plan_sesiones_totales integer not null default 1 check (plan_sesiones_totales > 0),
  check (plan_sesiones_hechas <= plan_sesiones_totales)
);

-- ordenes: Visita { fecha, nota, profesional, lesiones }
create table public.visitas (
  id              bigint generated always as identity primary key,
  ficha_id        text not null references public.fichas (id),
  fecha           date not null,
  nota            text not null,
  profesional_id  text not null references public.profesionales (id)
);

-- ordenes: Lesion { fdi, cara, estado }. Es la fila minima de la historia clinica.
create table public.lesiones (
  id        bigint generated always as identity primary key,
  visita_id bigint not null references public.visitas (id),
  fdi       smallint not null
            check (fdi between 11 and 48 and fdi % 10 between 1 and 8),   -- sistema FDI: cuadrante 1-4, pieza 1-8
  cara      text not null
            check (cara in ('oclusal', 'vestibular', 'lingual', 'mesial', 'distal', 'todas')),
  estado    text not null
            check (estado in ('sana', 'caries', 'obturada', 'corona', 'endodoncia', 'ausente', 'a extraer'))
);

create index fichas_paciente_idx on public.fichas (paciente_id);
create index visitas_ficha_fecha_idx on public.visitas (ficha_id, fecha);
create index lesiones_visita_idx on public.lesiones (visita_id);
create index pacientes_ultima_visita_idx on public.pacientes (ultima_visita);
```

**Bloque C: agenda, mensajes, panel y configuración**

```sql
-- agenda: Turno { id, sillonId, dentistaId, paciente, fichaId, tratamiento, inicio, duracion, estado, obraSocial }
-- inicio y duracion son MINUTOS (inicio = minutos desde medianoche), igual que en el mock.
-- ficha_id puede ser nulo: en el demo, algunos turnos apuntan a fichas que no estan en data.json.
create table public.turnos (
  id             text primary key,                    -- 'T-01'
  fecha          date not null,
  sillon_id      text not null references public.sillones (id),
  profesional_id text not null references public.profesionales (id),
  paciente_id    text not null references public.pacientes (id),
  ficha_id       text references public.fichas (id),
  tratamiento    text not null,
  inicio_min     integer not null check (inicio_min between 0 and 1439),
  duracion_min   integer not null check (duracion_min > 0),
  estado         text not null
                 check (estado in ('confirmado', 'en sala', 'atendido', 'ausente', 'cancelado')),
  obra_social    text,
  recordatorio_enviado_en timestamptz,                -- lo completa el worker de la etapa 4
  -- Un sillon no puede tener dos turnos cuyo ciclo completo se pise:
  -- montaje (10 min) + atencion + esterilizacion (20 min). Son los valores de theme.ciclo.
  -- Si cambias theme.ciclo, tenes que recrear esta restriccion con los numeros nuevos.
  constraint turnos_sin_solape exclude using gist (
    sillon_id with =,
    fecha with =,
    int4range(inicio_min - 10, inicio_min + duracion_min + 20) with &&
  ) where (estado <> 'cancelado')
);

create index turnos_fecha_sillon_idx on public.turnos (fecha, sillon_id);
create index turnos_paciente_idx on public.turnos (paciente_id);

-- conversaciones: Hilo { id, paciente, motivo, canal, ultimo, hora, sinLeer, mensajes }
-- ultimo, hora y sinLeer se calculan a partir de los mensajes.
create table public.hilos (
  id          text primary key,                       -- 'H-01'
  paciente_id text not null references public.pacientes (id),
  motivo      text not null,
  canal       text not null check (canal in ('whatsapp', 'email', 'web'))
);

create table public.mensajes (
  id         bigint generated always as identity primary key,
  hilo_id    text not null references public.hilos (id) on delete cascade,
  de         text not null check (de in ('paciente', 'clinica')),
  texto      text not null,
  enviado_en timestamptz not null default now(),
  leido      boolean not null default false
);

create index hilos_paciente_idx on public.hilos (paciente_id);
create index mensajes_hilo_idx on public.mensajes (hilo_id, enviado_en);

-- dashboard: produccion del mes (el donut) = conteo de tratamientos por categoria
create table public.tratamientos (
  id        bigint generated always as identity primary key,
  fecha     date not null default current_date,
  ficha_id  text references public.fichas (id),
  categoria text not null
            check (categoria in ('Profilaxis', 'Obturaciones', 'Endodoncias', 'Coronas y protesis', 'Extracciones'))
);

-- dashboard: lista de recall ("a quien hay que llamar") y su motivo
create table public.seguimientos (
  id          bigint generated always as identity primary key,
  paciente_id text not null references public.pacientes (id),
  motivo      text not null,                          -- 'Conducto 36 sin terminar'
  resuelto    boolean not null default false,
  creado_en   timestamptz not null default now()
);

create index tratamientos_fecha_idx on public.tratamientos (fecha, categoria);
create index seguimientos_pendientes_idx on public.seguimientos (paciente_id) where not resuelto;

-- config: los umbrales (recall, ciclo, no-show...) como una sola fila jsonb
create table public.ajustes (
  id    integer primary key default 1 check (id = 1),
  datos jsonb not null default '{}'::jsonb
);
insert into public.ajustes (id) values (1);

-- Registro de quien toco que (append-only; lo llenan los triggers del bloque E)
create table public.auditoria (
  id      bigint generated always as identity primary key,
  cuando  timestamptz not null default now(),
  user_id uuid,
  tabla   text not null,
  accion  text not null,
  fila_id text
);
```

**Bloque D: vista de pacientes (edad y días calculados)**

```sql
-- security_invoker = true hace que la vista respete las policies de la tabla.
-- Sin eso, una vista corre con los permisos de su dueño y se saltea RLS.
create view public.pacientes_v with (security_invoker = true) as
select
  p.id,
  p.nombre,
  p.email,
  p.telefono,
  p.obra_social,
  p.estado_os,
  p.ultima_visita,
  extract(year from age(current_date, p.fecha_nacimiento))::int as edad,
  (current_date - p.ultima_visita) as dias_desde_visita,
  cardinality(p.alertas) as cantidad_alertas
from public.pacientes p;
```

**Bloque E: seguridad (RLS), roles y auditoría**

Esto es lo más importante de la guía: sin RLS, cualquiera con la clave pública podría leer la base entera.

```sql
-- Funciones de ayuda en un schema "private" (no expuesto por la API).
-- security definer = corren con permisos del dueño, para leer perfiles sin entrar en bucle con RLS.
create schema if not exists private;

create function private.rol_actual()
returns text
language sql stable security definer set search_path = ''
as $$
  select p.rol from public.perfiles p where p.user_id = (select auth.uid())
$$;

create function private.profesional_actual()
returns text
language sql stable security definer set search_path = ''
as $$
  select p.profesional_id from public.perfiles p where p.user_id = (select auth.uid())
$$;

revoke execute on function private.rol_actual(), private.profesional_actual() from public;
grant usage on schema private to authenticated;
grant execute on function private.rol_actual(), private.profesional_actual() to authenticated;

-- 1) Activar RLS en TODAS las tablas.
alter table public.sillones      enable row level security;
alter table public.profesionales enable row level security;
alter table public.perfiles      enable row level security;
alter table public.pacientes     enable row level security;
alter table public.fichas        enable row level security;
alter table public.visitas       enable row level security;
alter table public.lesiones      enable row level security;
alter table public.turnos        enable row level security;
alter table public.hilos         enable row level security;
alter table public.mensajes      enable row level security;
alter table public.tratamientos  enable row level security;
alter table public.seguimientos  enable row level security;
alter table public.ajustes       enable row level security;
alter table public.auditoria     enable row level security;

-- 2) Permisos de tabla: nada para "anon" (visitantes sin login); lo justo para "authenticated".
revoke all on all tables in schema public from anon;
grant select, insert, update on public.sillones, public.profesionales, public.pacientes, public.fichas,
  public.turnos, public.hilos, public.mensajes, public.seguimientos, public.ajustes to authenticated;
grant select, insert on public.visitas, public.lesiones, public.tratamientos to authenticated;  -- historia clinica: sin update ni delete
grant select on public.perfiles, public.auditoria, public.pacientes_v to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- 3) Policies. Regla general: sin fila en "perfiles" no ves nada.
-- perfiles: cada usuario ve su propia fila
create policy "perfiles: cada uno ve el suyo" on public.perfiles
  for select to authenticated using (user_id = (select auth.uid()));

-- catalogos: leen todos los perfiles, escribe admin
create policy "sillones: leen los perfiles" on public.sillones
  for select to authenticated using ((select private.rol_actual()) is not null);
create policy "sillones: escribe admin" on public.sillones
  for all to authenticated
  using ((select private.rol_actual()) = 'admin') with check ((select private.rol_actual()) = 'admin');

create policy "profesionales: leen los perfiles" on public.profesionales
  for select to authenticated using ((select private.rol_actual()) is not null);
create policy "profesionales: escribe admin" on public.profesionales
  for all to authenticated
  using ((select private.rol_actual()) = 'admin') with check ((select private.rol_actual()) = 'admin');

-- pacientes: leen todos los perfiles; crea y edita recepcion o admin; NADIE borra
create policy "pacientes: leen los perfiles" on public.pacientes
  for select to authenticated using ((select private.rol_actual()) is not null);
create policy "pacientes: crea recepcion o admin" on public.pacientes
  for insert to authenticated with check ((select private.rol_actual()) in ('recepcion', 'admin'));
create policy "pacientes: edita recepcion o admin" on public.pacientes
  for update to authenticated
  using ((select private.rol_actual()) in ('recepcion', 'admin'))
  with check ((select private.rol_actual()) in ('recepcion', 'admin'));

-- fichas (el plan de tratamiento): leen todos los perfiles; escriben profesional o admin
create policy "fichas: leen los perfiles" on public.fichas
  for select to authenticated using ((select private.rol_actual()) is not null);
create policy "fichas: crea profesional o admin" on public.fichas
  for insert to authenticated with check ((select private.rol_actual()) in ('profesional', 'admin'));
create policy "fichas: edita profesional o admin" on public.fichas
  for update to authenticated
  using ((select private.rol_actual()) in ('profesional', 'admin'))
  with check ((select private.rol_actual()) in ('profesional', 'admin'));

-- visitas y lesiones = HISTORIA CLINICA: solo profesionales y admin la ven; solo se AGREGA.
-- No hay policy de update ni de delete: las correcciones van como una visita nueva.
create policy "visitas: leen profesional y admin" on public.visitas
  for select to authenticated using ((select private.rol_actual()) in ('profesional', 'admin'));
create policy "visitas: el profesional agrega las suyas" on public.visitas
  for insert to authenticated
  with check (
    (select private.rol_actual()) = 'admin'
    or ((select private.rol_actual()) = 'profesional' and profesional_id = (select private.profesional_actual()))
  );

create policy "lesiones: leen profesional y admin" on public.lesiones
  for select to authenticated using ((select private.rol_actual()) in ('profesional', 'admin'));
create policy "lesiones: se agregan a una visita propia" on public.lesiones
  for insert to authenticated
  with check (
    (select private.rol_actual()) = 'admin'
    or exists (
      select 1 from public.visitas v
      where v.id = visita_id and v.profesional_id = (select private.profesional_actual())
    )
  );

-- turnos: leen todos; crea y edita recepcion o admin; el profesional actualiza los suyos (marcar "atendido")
create policy "turnos: leen los perfiles" on public.turnos
  for select to authenticated using ((select private.rol_actual()) is not null);
create policy "turnos: crea recepcion o admin" on public.turnos
  for insert to authenticated with check ((select private.rol_actual()) in ('recepcion', 'admin'));
create policy "turnos: edita recepcion o admin" on public.turnos
  for update to authenticated
  using ((select private.rol_actual()) in ('recepcion', 'admin'))
  with check ((select private.rol_actual()) in ('recepcion', 'admin'));
create policy "turnos: el profesional edita los suyos" on public.turnos
  for update to authenticated
  using ((select private.rol_actual()) = 'profesional' and profesional_id = (select private.profesional_actual()))
  with check ((select private.rol_actual()) = 'profesional' and profesional_id = (select private.profesional_actual()));

-- mensajes y seguimientos: recepcion y admin (el contenido clinico NO viaja por aca)
create policy "hilos: recepcion y admin" on public.hilos
  for all to authenticated
  using ((select private.rol_actual()) in ('recepcion', 'admin'))
  with check ((select private.rol_actual()) in ('recepcion', 'admin'));
create policy "mensajes: recepcion y admin" on public.mensajes
  for all to authenticated
  using ((select private.rol_actual()) in ('recepcion', 'admin'))
  with check ((select private.rol_actual()) in ('recepcion', 'admin'));
create policy "seguimientos: recepcion y admin" on public.seguimientos
  for all to authenticated
  using ((select private.rol_actual()) in ('recepcion', 'admin'))
  with check ((select private.rol_actual()) in ('recepcion', 'admin'));

-- tratamientos: leen todos; agregan profesional o admin
create policy "tratamientos: leen los perfiles" on public.tratamientos
  for select to authenticated using ((select private.rol_actual()) is not null);
create policy "tratamientos: agregan profesional o admin" on public.tratamientos
  for insert to authenticated with check ((select private.rol_actual()) in ('profesional', 'admin'));

-- ajustes: leen todos, edita admin
create policy "ajustes: leen los perfiles" on public.ajustes
  for select to authenticated using ((select private.rol_actual()) is not null);
create policy "ajustes: edita admin" on public.ajustes
  for update to authenticated
  using ((select private.rol_actual()) = 'admin') with check ((select private.rol_actual()) = 'admin');

-- auditoria: la lee solo admin; nadie escribe a mano (la llenan los triggers)
create policy "auditoria: lee admin" on public.auditoria
  for select to authenticated using ((select private.rol_actual()) = 'admin');

-- 4) Auditoria de escrituras sobre datos clinicos
create function private.auditar()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.auditoria (user_id, tabla, accion, fila_id)
  values ((select auth.uid()), tg_table_name, tg_op, coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id'));
  return null;
end;
$$;

create trigger auditar_pacientes after insert or update or delete on public.pacientes
  for each row execute function private.auditar();
create trigger auditar_fichas after insert or update or delete on public.fichas
  for each row execute function private.auditar();
create trigger auditar_visitas after insert or update or delete on public.visitas
  for each row execute function private.auditar();
create trigger auditar_lesiones after insert or update or delete on public.lesiones
  for each row execute function private.auditar();
```

Qué hace cada rol con esta configuración:

| Rol | Ve | Escribe |
|---|---|---|
| `admin` | todo, incluida la auditoría | todo salvo borrar historia clínica (nadie puede) |
| `recepcion` | agenda, pacientes, fichas (plan), mensajes y seguimientos; **no** ve visitas ni lesiones | turnos, pacientes, mensajes, seguimientos |
| `profesional` | agenda, pacientes, fichas, visitas y lesiones | sus propias visitas y lesiones, y el estado de sus propios turnos |

> **Qué NO cubre este SQL:** la auditoría registra **escrituras**, no **lecturas** (quién abrió una ficha). Para eso necesitás el registro de consultas de Postgres o la extensión `pgaudit`; revisá qué ofrece tu plan de Supabase. Tampoco cifra columnas individuales: el cifrado en reposo lo da la plataforma, y cualquier cifrado adicional de campos es una decisión de diseño tuya.

### 3.4 Crear tu primer usuario

1. En el panel: **Authentication** → **Users** → **Add user** → **Create new user**. Cargá un mail y una contraseña fuerte.
2. Apagá el registro público para que nadie se cree una cuenta solo: en **Authentication** buscá la opción que dice algo como *Allow new users to sign up* y desactivala. (Los nombres de los menús cambian con el tiempo; si no lo encontrás, usá el buscador del panel con la palabra `sign up`.)
3. Copiá el **UUID** del usuario y dale un rol (cambiá el UUID por el tuyo):

```sql
insert into public.perfiles (user_id, rol)
values ('00000000-0000-0000-0000-000000000000', 'admin');
```

### 3.5 Cargar los datos de ejemplo

Los `data.json` son anidados (una ficha trae sus visitas y cada visita sus lesiones), así que **no sirven para importar como CSV directo** desde el Table Editor. Dos caminos:

- **Camino rápido (solo para tablas planas):** en **Table Editor** → elegí la tabla → **Insert** → **Import data from CSV**. Sirve para `sillones` y `profesionales` (dos columnas). Las fechas del JSON vienen como `10/04/2026` y Postgres espera `2026-04-10`: hay que convertirlas antes.
- **Camino recomendado:** un script de una sola vez que lee los `data.json`, los convierte y los inserta. Creá el archivo `scripts/seed.mjs` en **tu copia** (no existe en este repo):

```js
// scripts/seed.mjs: correr UNA sola vez, en tu computadora.
// Usa la clave service_role, que se saltea RLS. NUNCA va al frontend ni a un repositorio.
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local")

const sb = createClient(url, key, { auth: { persistSession: false } })
const leer = (modulo) => JSON.parse(readFileSync(`modules/${modulo}/data.json`, "utf8"))
const fecha = (dmy) => { const [d, m, y] = dmy.split("/"); return `${y}-${m}-${d}` } // 10/04/2026 -> 2026-04-10
const ok = ({ error }, paso) => { if (error) throw new Error(`${paso}: ${error.message}`) }
const hoy = new Date().toISOString().slice(0, 10)

const agenda = leer("agenda")
const contactos = leer("contactos")
const ordenes = leer("ordenes")
const conv = leer("conversaciones")
const dash = leer("dashboard")

// 1. catalogos
ok(await sb.from("sillones").upsert(agenda.sillones), "sillones")
ok(await sb.from("profesionales").upsert(agenda.dentistas), "profesionales")
const idProfesional = new Map(agenda.dentistas.map((d) => [d.nombre, d.id]))

// 2. pacientes (el mock solo trae la edad: la fecha de nacimiento es aproximada)
const alertasDe = (p) =>
  ordenes.fichas.find((f) => f.paciente === p.nombre)?.alertas ??
  Array.from({ length: p.alertas }, (_, i) => `Alerta médica ${i + 1}`)
ok(
  await sb.from("pacientes").upsert(
    contactos.pacientes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      fecha_nacimiento: `${new Date().getFullYear() - p.edad}-06-30`,
      email: p.email,
      telefono: p.telefono,
      obra_social: p.obraSocial,
      estado_os: p.estadoOS,
      ultima_visita: fecha(p.ultimaVisita),
      alertas: alertasDe(p),
    })),
  ),
  "pacientes",
)
const idPaciente = new Map(contactos.pacientes.map((p) => [p.nombre, p.id]))

// 3. fichas, visitas y lesiones
ok(
  await sb.from("fichas").upsert(
    ordenes.fichas.map((f) => ({
      id: f.id,
      paciente_id: idPaciente.get(f.paciente),
      plan_nombre: f.plan.nombre,
      plan_sesiones_hechas: f.plan.sesionesHechas,
      plan_sesiones_totales: f.plan.sesionesTotales,
    })),
  ),
  "fichas",
)
for (const f of ordenes.fichas) {
  for (const v of f.visitas) {
    const { data, error } = await sb
      .from("visitas")
      .insert({ ficha_id: f.id, fecha: fecha(v.fecha), nota: v.nota, profesional_id: idProfesional.get(v.profesional) })
      .select("id")
      .single()
    if (error) throw new Error(`visita de ${f.id}: ${error.message}`)
    if (v.lesiones.length) {
      ok(
        await sb.from("lesiones").insert(
          v.lesiones.map((l) => ({ visita_id: data.id, fdi: l.fdi, cara: l.cara, estado: l.estado })),
        ),
        "lesiones",
      )
    }
  }
}

// 4. turnos de hoy (algunos apuntan a fichas que el demo no trae: quedan con ficha_id nulo)
const fichasQueExisten = new Set(ordenes.fichas.map((f) => f.id))
ok(
  await sb.from("turnos").upsert(
    agenda.turnos.map((t) => ({
      id: t.id,
      fecha: hoy,
      sillon_id: t.sillonId,
      profesional_id: t.dentistaId,
      paciente_id: idPaciente.get(t.paciente),
      ficha_id: fichasQueExisten.has(t.fichaId) ? t.fichaId : null,
      tratamiento: t.tratamiento,
      inicio_min: t.inicio,
      duracion_min: t.duracion,
      estado: t.estado,
      obra_social: t.obraSocial,
    })),
  ),
  "turnos",
)

// 5. mensajes
ok(
  await sb.from("hilos").upsert(
    conv.hilos.map((h) => ({ id: h.id, paciente_id: idPaciente.get(h.paciente), motivo: h.motivo, canal: h.canal })),
  ),
  "hilos",
)
for (const h of conv.hilos) {
  ok(
    await sb.from("mensajes").insert(
      h.mensajes.map((m, i) => ({
        hilo_id: h.id,
        de: m.de,
        texto: m.texto,
        enviado_en: new Date(`${hoy}T${m.hora}:00`).toISOString(),
        leido: i < h.mensajes.length - h.sinLeer, // los ultimos "sinLeer" quedan sin leer
      })),
    ),
    "mensajes",
  )
}

// 6. panel: produccion del mes y lista de recall
ok(
  await sb.from("tratamientos").insert(
    dash.produccion.flatMap((p) => Array.from({ length: p.valor }, () => ({ fecha: hoy, categoria: p.label }))),
  ),
  "tratamientos",
)
ok(
  await sb.from("seguimientos").insert(
    dash.recall.map((r) => ({ paciente_id: idPaciente.get(r.paciente), motivo: r.motivo })),
  ),
  "seguimientos",
)

console.log("Listo: datos de ejemplo cargados.")
```

Instalá el cliente y corrélo desde la raíz del proyecto (Node 20.6 o mayor por `--env-file`):

```bash
npm install @supabase/supabase-js @supabase/ssr
node --env-file=.env.local scripts/seed.mjs
```

> Corrélo **una sola vez**: las visitas y los mensajes no son repetibles. Si tenés que empezar de cero, en el SQL Editor corré `truncate public.lesiones, public.visitas, public.mensajes, public.hilos, public.tratamientos, public.seguimientos, public.turnos, public.fichas, public.pacientes, public.auditoria restart identity cascade;` y volvé a correr el script.

### 3.6 Variables de entorno

En la raíz del proyecto ya hay un archivo `.env.example` con los nombres y **sin valores**. Copialo a `.env.local` (este sí se ignora en Git) y completalo:

```bash
cp .env.example .env.local
```

| Variable | De dónde sale | Va al navegador |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → **API** → *Project URL* | Sí (es pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → **API Keys**. Puede llamarse *anon* (clásica) o *publishable* (nueva): sirve cualquiera de las dos | Sí (es pública, la protege RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Misma pantalla, clave *service_role* (o *secret*) | **NO. Jamás.** |

**Reglas que no se negocian:**

- `SUPABASE_SERVICE_ROLE_KEY` **se saltea toda la seguridad de la base**. **Nunca** lleva el prefijo `NEXT_PUBLIC_` (ese prefijo la metería dentro del JavaScript que descarga cualquiera). La usás solo en scripts locales (el seed) y en servidores tuyos (el worker de Railway).
- `.env.local` **no se sube a Git**. El `.gitignore` ya lo evita.
- Si pegaste una clave en un chat, un commit o una captura, **rotala** desde el panel de Supabase.
- Algunas guías nuevas de Supabase llaman a la clave pública `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. En este proyecto usamos `NEXT_PUBLIC_SUPABASE_ANON_KEY`; lo único que importa es que el nombre del `.env` y el de tu código coincidan.

### 3.7 Dónde se crea el cliente (`lib/supabase`)

Creá estos archivos en **tu copia**. Son los dos clientes que recomienda Supabase para Next.js con App Router (sintaxis verificada contra la documentación de `@supabase/ssr`).

```ts
// lib/supabase/client.ts : para componentes con "use client" (todos los módulos de este demo)
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

```ts
// lib/supabase/server.ts : para Server Components, Route Handlers y Server Actions
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Llamado desde un Server Component: se ignora porque el middleware refresca la sesion.
          }
        },
      },
    },
  )
}
```

### 3.8 Antes y después: una función real

Todos los módulos del demo son componentes de cliente que llaman a `api.ts` desde un `useEffect`, así que acá se usa el cliente de navegador. Tomamos `getPacientes` de `modules/contactos/api.ts`.

**Antes (demo):**

```ts
export async function getPacientes(): Promise<Paciente[]> {
  await sleep(300)
  return structuredClone(raw.pacientes) as Paciente[]
}
```

**Después (con Supabase):** la firma es idéntica, solo cambia el cuerpo. Borrá `import raw from "./data.json"` y la función `sleep` cuando ya no las uses.

```ts
import { createClient } from "@/lib/supabase/client"

// "2026-04-10" -> "10/04/2026", el formato que ya muestra la pantalla
const dmy = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""

export async function getPacientes(): Promise<Paciente[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("pacientes_v")
    .select("id, nombre, edad, email, telefono, obra_social, estado_os, ultima_visita, dias_desde_visita, cantidad_alertas")
    .order("nombre")

  if (error) throw new Error(`No se pudieron cargar los pacientes: ${error.message}`)

  return (data ?? []).map((r) => ({
    id: r.id,
    nombre: r.nombre,
    edad: r.edad ?? 0,
    email: r.email ?? "",
    telefono: r.telefono ?? "",
    obraSocial: r.obra_social,
    estadoOS: r.estado_os,
    ultimaVisita: dmy(r.ultima_visita),
    diasDesdeVisita: r.dias_desde_visita ?? 0,
    alertas: r.cantidad_alertas,
  }))
}
```

Tres cosas para tener en cuenta:

- **El manejo de error es parte del cambio.** El demo no falla nunca; la base sí. Hoy las pantallas no tienen estado de error: agregá uno (un mensaje "No se pudo cargar" con un botón para reintentar) cuando conectes el primer módulo.
- **Traducí siempre `snake_case` a `camelCase` en el `api.ts`.** Así los componentes no cambian.
- **Para `getFichas`** necesitás una consulta anidada: `.from("fichas").select("*, pacientes(*), visitas(*, lesiones(*))")`. Después armás el objeto `Ficha` con el mismo mapeo (`plan_sesiones_hechas` → `plan.sesionesHechas`, y así). `paciente`, `edad`, `obraSocial`, `estadoOS`, `ultimaVisita` y `alertas` vienen de la tabla `pacientes` (la ficha no los repite). Con el rol `recepcion` esa consulta devuelve `visitas` vacías: es lo esperado.
- **Para `getTurnosDia(fecha)`** filtrá con `.eq("fecha", fecha)`. Hoy el demo ignora el parámetro y devuelve el mismo día siempre; con base de datos pasale una fecha `YYYY-MM-DD` real.

Opcional pero útil: generá los tipos de tu base y dejá que TypeScript te avise si un nombre de columna está mal.

```bash
npx supabase gen types typescript --project-id tu-proyecto --schema public > lib/supabase/database.types.ts
```

### 3.9 Login con Supabase Auth (reemplaza el auth stub)

El demo trae `shell/auth-stub.ts`, que siempre devuelve "Usuario Demo". Se reemplaza por **Supabase Auth**. **Nunca Clerk** en este stack.

**1. Pantalla de login** (`app/login/page.tsx`):

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) return setError("Mail o contraseña incorrectos")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={entrar} className="mx-auto mt-24 max-w-sm space-y-3">
      <h1 className="font-heading text-2xl font-bold">Ingresar</h1>
      <label className="block text-sm">
        Mail
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="target mt-1 w-full rounded-xl border border-border px-3" />
      </label>
      <label className="block text-sm">
        Contraseña
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="target mt-1 w-full rounded-xl border border-border px-3" />
      </label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" className="target w-full rounded-xl bg-primary px-4 font-semibold text-surface">Entrar</button>
    </form>
  )
}
```

**2. Middleware** que refresca la sesión y manda a `/login` a quien no inició sesión. En Next.js 15 el archivo se llama `middleware.ts` (en Next.js 16 pasa a llamarse `proxy.ts`). Va en la raíz del proyecto:

```ts
// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // No pongas codigo entre createServerClient y getUser(): puede desloguear usuarios al azar.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
```

**3. Reemplazá `shell/auth-stub.ts`** por una versión que lee la sesión real (devuelve `null` si no hay sesión):

```ts
import { createClient } from "@/lib/supabase/server"

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? { user: { id: user.id, name: user.email ?? "Usuario" } } : null
}
```

Cerrar sesión: `await createClient().auth.signOut()` desde un botón en la barra lateral.

> **Verificá la seguridad de verdad:** abrí una ventana de incógnito sin iniciar sesión y probá entrar a `/dashboard`: tiene que mandarte a `/login`. Después probá con un usuario `recepcion` abrir `/ordenes`: no debería ver visitas ni lesiones.

---

## 4. Railway: tareas en segundo plano con pg-boss

### 4.1 Para qué sirve, en criollo

La pantalla solo trabaja cuando alguien la tiene abierta. Pero una clínica necesita cosas que pasen **solas, aunque nadie esté mirando**: mandar un recordatorio el día anterior al turno, avisar a los pacientes que hace seis meses que no vienen. Eso es un **worker**: un programa chico que corre todo el día en un servidor y revisa una **cola de tareas**.

- **pg-boss** es la cola de tareas. Guarda las tareas **dentro de tu base de Postgres** (la de Supabase), en un schema aparte llamado `pgboss`. No necesitás Redis ni otro servicio.
- **Railway** es el servidor donde corre el worker las 24 horas. (Vercel, donde va el sitio, no sirve para esto: sus funciones viven segundos, no corren todo el día.)

Casos de **esta** clínica que lo necesitan:

| Tarea | Cuándo corre | Qué hace |
|---|---|---|
| Recordatorio de turno | 24 h antes de cada turno confirmado | Manda el aviso al paciente por WhatsApp o mail y completa `turnos.recordatorio_enviado_en` |
| Recall de pacientes | Todos los días a la mañana | Busca pacientes sin visita hace más de `theme.recall.alerta` días (180) y crea un `seguimiento` para que recepción los llame |
| Aviso de plan abandonado / presupuesto pendiente | Todos los días | Busca fichas con plan sin terminar y sin sesión hace más de `theme.plan.abandonado` días (90) y crea un `seguimiento` |
| Marcar ausentes | Al cerrar el día | Pasa a `ausente` los turnos `confirmado` cuyo horario ya pasó |

### 4.2 Qué conexión usar (directa o pooler)

pg-boss necesita **la cadena de conexión a Postgres**, no la URL de la API (`https://...supabase.co`) que usaste hasta ahora. La sacás del panel: botón **Connect** → *Connection string*. Hay varias:

| Opción | Cuándo usarla |
|---|---|
| **Conexión directa** (`db.<ref>.supabase.co`, puerto 5432) | Servidores que quedan prendidos todo el día, **si tu servidor tiene IPv6** (o comprás el add-on de IPv4). |
| **Pooler en modo sesión** (puerto 5432 del host `...pooler.supabase.com`) | Servidores que quedan prendidos pero **solo tienen IPv4**. Funciona en todos los planes. |
| **Pooler en modo transacción** (puerto 6543) | Funciones *serverless* que abren y cierran conexiones todo el tiempo. **No es para un worker que queda prendido.** |

**Para el worker de pg-boss usá la conexión directa o el pooler en modo sesión.** Si no sabés si tu servidor de Railway tiene IPv6, empezá por el **pooler en modo sesión**, que anda en todos lados. Copiá la cadena desde el botón *Connect*; no la armes a mano. La contraseña es la que elegiste al crear el proyecto.

> pg-boss crea su propio schema `pgboss` la primera vez que arranca, así que el usuario de la cadena tiene que poder crear schemas (el usuario `postgres` de Supabase puede). Por defecto, la API de Supabase solo expone `public`, así que el schema `pgboss` queda fuera.

### 4.3 Crear el servicio en Railway

El worker es **otro programa**, con su propio `package.json`. Va en un **repositorio aparte** (o en una carpeta `worker/` de **tu** copia privada). No lo agregues a este demo.

1. Entrá a https://railway.com y creá una cuenta.
2. **New Project** → **Deploy from GitHub repo** y elegí el repositorio del worker. (Si el worker vive en una carpeta de un repo más grande, en **Settings → Source** poné la carpeta en *Root Directory*.)
3. En **Settings → Deploy** completá **Custom Start Command** con `node index.mjs`.
4. En **Variables** cargá las tres variables de abajo.
5. En el `package.json` del worker declará la versión de Node, porque pg-boss pide **Node 22.12 o mayor**:

```json
{
  "name": "esmalte-worker",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": { "start": "node index.mjs" }
}
```

Instalá las dos librerías (así npm anota la versión actual en el `package.json`) y revisá en el log del primer deploy que Railway usó Node 22.12 o mayor:

```bash
npm install pg-boss @supabase/supabase-js
```

| Variable en Railway | Valor |
|---|---|
| `DATABASE_URL` | La cadena de conexión de Postgres (4.2) |
| `SUPABASE_URL` | La misma *Project URL* de siempre |
| `SUPABASE_SERVICE_ROLE_KEY` | La clave *service_role*. Vive **solo** en Railway: el worker corre sin usuario logueado, así que necesita saltarse RLS |

> El worker tiene **acceso total** a la base. Tratá a Railway con el mismo cuidado que a Supabase: autenticación en dos pasos, pocas personas con acceso, y nada de logs con datos de pacientes.

### 4.4 Esqueleto de un worker (ejemplo para tu repo del worker)

Es un esqueleto: muestra la forma, no manda mensajes de verdad. Los nombres de funciones (`createQueue`, `send`/`sendAfter`, `work`, `schedule`, `stop`) están verificados contra la documentación de pg-boss. En la versión actual el `work` recibe un **arreglo** de tareas.

```js
// index.mjs : el worker (vive en tu repo del worker, NO en este demo)
import { PgBoss } from "pg-boss"
import { createClient } from "@supabase/supabase-js"

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const boss = new PgBoss(process.env.DATABASE_URL)
boss.on("error", (error) => console.error("pg-boss:", error.message)) // sin datos de pacientes en los logs

await boss.start() // abre la conexion y crea el schema pgboss si no existe

// Las colas se crean una vez; es seguro repetirlo en cada arranque.
await boss.createQueue("recordatorio-turno")
await boss.createQueue("recall-diario")

// 1) Recordatorio de turno. La app lo encola con boss.sendAfter(...) cuando se confirma un turno.
await boss.work("recordatorio-turno", async ([job]) => {
  const { turnoId } = job.data
  const { data: turno, error } = await sb
    .from("turnos")
    .select("id, estado, recordatorio_enviado_en, pacientes(telefono, nombre)")
    .eq("id", turnoId)
    .single()
  if (error) throw error // pg-boss reintenta segun la configuracion de la cola
  if (turno.estado !== "confirmado" || turno.recordatorio_enviado_en) return // se cancelo o ya se mando

  // Aca va tu proveedor de WhatsApp o mail (Meta, Twilio, Resend...). No esta incluido.
  // await enviarRecordatorio(turno.pacientes.telefono, ...)

  await sb.from("turnos").update({ recordatorio_enviado_en: new Date().toISOString() }).eq("id", turnoId)
})

// 2) Recall: todos los dias a las 9 de la manana, hora de la clinica.
await boss.schedule("recall-diario", "0 9 * * *", {}, { tz: "America/Argentina/Buenos_Aires" })
await boss.work("recall-diario", async () => {
  const limite = new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString().slice(0, 10) // theme.recall.alerta
  const { data: pacientes } = await sb.from("pacientes").select("id").lt("ultima_visita", limite)
  for (const p of pacientes ?? []) {
    await sb.from("seguimientos").insert({ paciente_id: p.id, motivo: "Control semestral" })
  }
})

// Apagado ordenado cuando Railway reinicia el servicio
process.on("SIGTERM", async () => {
  await boss.stop()
  process.exit(0)
})
```

Cómo se encola un recordatorio desde el backend de tu app cuando se confirma un turno. `segundosHastaUnDiaAntes` es la cantidad de segundos que faltan desde ahora hasta 24 horas antes del turno (lo calculás con la fecha y la hora del turno):

```ts
// en el backend de TU app (con su propia instancia de PgBoss ya iniciada), al confirmar un turno
// formato: sendAfter(cola, datos, opciones, segundosDeEspera)
await boss.sendAfter("recordatorio-turno", { turnoId: turno.id }, {}, segundosHastaUnDiaAntes)
```

Dos cuidados propios de este rubro:

- **El recall no debería insistir.** Antes de insertar un `seguimiento`, fijate que el paciente no tenga ya uno sin resolver (`resuelto = false`), o vas a llenar la lista de duplicados cada mañana.
- **Qué mandás por mensaje.** El recordatorio dice día, hora y clínica. **No** dice motivo clínico, tratamiento ni diagnóstico.

---

## 5. Vercel: publicar el sistema

1. Subí **tu copia** a un repositorio **privado** de GitHub (con datos reales, nunca público).
2. Entrá a https://vercel.com, iniciá sesión con GitHub y elegí **Add New → Project**.
3. **Import** el repositorio. Vercel detecta **Next.js** solo: no cambies nada de *Framework Preset*, *Build Command* ni *Output Directory*.
4. Abrí **Environment Variables** y cargá las dos variables públicas. Para cada una elegí a qué entornos aplican (**Production**, **Preview**, **Development**):

| Variable | Production | Preview |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | proyecto real | **un proyecto de pruebas** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave del proyecto real | clave del proyecto de pruebas |

   Las previews (cada rama y cada pull request) son URLs que se pueden compartir: **no las conectes a la base con pacientes reales.** Usá un segundo proyecto de Supabase con datos ficticios.

   **No cargues `SUPABASE_SERVICE_ROLE_KEY` en Vercel** salvo que una Route Handler server-side la necesite de verdad.
5. **Deploy**. En un par de minutos tenés una URL `https://tu-proyecto.vercel.app`.
6. **Dominio propio:** **Settings → Domains** → agregá tu dominio y seguí las instrucciones de DNS que muestra Vercel (el certificado HTTPS es automático).
7. **Redeploy automático:** cada `git push` a la rama principal publica una versión nueva de producción; cada rama o pull request genera una *preview*. No hace falta tocar nada más.
8. En Supabase: **Authentication → URL Configuration** y agregá tu dominio de producción como *Site URL* (y las URLs de preview si las usás), para que el login funcione desde ahí.

> Las variables `NEXT_PUBLIC_*` se **incrustan en el código al momento del build**. Si las cambiás en Vercel, tenés que hacer **Redeploy** para que el cambio se vea.

**Si el build falla:** abrí el deploy fallido y leé el log desde el primer `Error`. Las causas más comunes están en la tabla de la sección 8. Para reproducirlo en tu compu antes de subir:

```bash
npm run build
```

Si el build local falla igual, el problema está en el código y no en Vercel.

---

## 6. IA (OpenAI o Gemini) para este nicho

Este demo **no tiene un módulo de agente de IA ni de llamadas**: el módulo de comunicación es **Mensajes** (`conversaciones`). Dónde la IA aporta de verdad en una clínica dental:

- **Sugerir la respuesta** a un mensaje de paciente (confirmar, reprogramar, explicar un rechazo de obra social). **Una persona de recepción revisa y envía**: la IA no contesta sola.
- **Resumir** el hilo o pasar una nota dictada a texto ordenado para la ficha (siempre revisada por el profesional).
- **Clasificar** el motivo de un mensaje entrante (turno, dolor, obra social, presupuesto).

### 6.1 Reglas

- **La clave de la IA vive solo en el servidor.** Nunca `NEXT_PUBLIC_`, nunca en un componente de cliente. El navegador le habla a **tu** Route Handler y esa ruta le habla a OpenAI o Gemini.
- **Antes de mandar texto de un paciente a un proveedor de IA**, revisá sus condiciones de uso de datos (si guardan o entrenan con lo que enviás) y evitá mandar lo que no hace falta: nada de nombre completo, documento ni teléfono si la tarea no los necesita.
- **La IA propone, una persona decide.** No dejes que una respuesta automática dé diagnósticos ni indicaciones clínicas.

### 6.2 Variables de entorno

En `.env.local` (y en Vercel, solo **Production** y **Preview** del servidor):

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
```

Elegí **un** proveedor. El nombre del modelo cambia seguido: copialo de la lista de modelos vigentes del proveedor y pegalo en `OPENAI_MODEL` o `GEMINI_MODEL` (por eso no está escrito a mano en el código).

### 6.3 Ejemplo mínimo: sugerir una respuesta (OpenAI)

```bash
npm install openai
```

```ts
// app/api/sugerir-respuesta/route.ts
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

const client = new OpenAI() // lee OPENAI_API_KEY del entorno del servidor

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { hiloId } = await request.json()

  // RLS aplica: solo ves mensajes si tu rol puede (recepcion o admin).
  const { data: mensajes, error } = await supabase
    .from("mensajes")
    .select("de, texto")
    .eq("hilo_id", hiloId)
    .order("enviado_en", { ascending: false })
    .limit(10)
  if (error) return Response.json({ error: "No se pudo leer el hilo" }, { status: 500 })

  const conversacion = (mensajes ?? [])
    .reverse()
    .map((m) => `${m.de === "paciente" ? "Paciente" : "Clinica"}: ${m.texto}`)
    .join("\n")

  const respuesta = await client.responses.create({
    model: process.env.OPENAI_MODEL!,
    instructions:
      "Sos recepcionista de una clinica dental. Redacta una respuesta corta, amable y en voseo. " +
      "No des diagnosticos ni indicaciones clinicas. Si hace falta, ofrece que la llame el profesional.",
    input: conversacion,
    max_output_tokens: 300, // tope de costo por llamada
  })

  return Response.json({ sugerencia: respuesta.output_text })
}
```

### 6.4 Lo mismo con Gemini

```bash
npm install @google/genai
```

```ts
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const respuesta = await ai.models.generateContent({
  model: process.env.GEMINI_MODEL!,
  contents: conversacion,
  config: {
    systemInstruction: "Sos recepcionista de una clinica dental. Respuesta corta, amable, en voseo. Sin diagnosticos.",
    maxOutputTokens: 300,
  },
})
// respuesta.text trae el texto generado
```

### 6.5 Costos y límites que tenés que vigilar

- **Se cobra por tokens** (lo que mandás más lo que responde). Hilos largos con mucho historial cuestan más: mandá solo los últimos mensajes (acá, 10) y poné siempre un tope de salida (`max_output_tokens` / `maxOutputTokens`).
- **Poné un límite de gasto mensual** en el panel del proveedor y una alerta de consumo. Es la protección más importante si alguien abusa de tu ruta.
- **Limitá las llamadas por usuario** (por ejemplo 30 por hora): guardá un contador por `user.id` o usá un servicio de rate limiting. Sin límite, una ruta pública de IA se convierte en tu mayor gasto.
- **Cada proveedor tiene límites de uso** (pedidos por minuto, tokens por minuto): manejá el error de "demasiados pedidos" con un reintento y un mensaje claro en pantalla.
- **Probá con datos ficticios** y revisá una muestra de respuestas antes de dejar que recepción las use.

---

## 7. Checklist de seguridad antes de publicar con datos reales

Tildá **todo** antes de cargar un solo paciente real.

**Base de datos**

- [ ] **RLS activada en todas las tablas** (el SQL de 3.3 lo hace). Verificalo: Table Editor no debe mostrar ningún aviso de "RLS disabled".
- [ ] Revisaste los **Advisors de seguridad** del panel de Supabase y no queda ninguno en rojo.
- [ ] `anon` no tiene permisos sobre tus tablas (el SQL de 3.3 revoca todo).
- [ ] Probaste con un usuario de cada rol que **solo ve lo que debe** (recepción no ve visitas ni lesiones; un profesional no inserta visitas con el nombre de otro).
- [ ] **Registro público de usuarios apagado**; los usuarios los creás vos.
- [ ] **Backups**: revisaste qué copias de seguridad incluye tu plan y **probaste restaurar** una (una copia que nunca restauraste no es una copia).

**Claves y repositorio**

- [ ] `SUPABASE_SERVICE_ROLE_KEY` **no está** en el frontend, ni con prefijo `NEXT_PUBLIC_`, ni en Vercel salvo necesidad real.
- [ ] `.env`, `.env.local` y similares **no están en Git**. El `.gitignore` ya ignora `.env` y `.env.*` pero **no** `.env.example` (que sí debe subirse, solo con placeholders vacíos). Si usás `vercel link`, mirá el final del `.gitignore`: puede agregar una línea `.env*` que vuelve a ignorar `.env.example`; borrala.
- [ ] Buscaste secretos en lo que vas a subir: `git grep -nE "sk-|service_role|eyJ"` no debe devolver claves reales.
- [ ] **El repositorio con datos reales es privado.** Un repositorio público nunca lleva datos de pacientes ni claves.
- [ ] Las claves que alguna vez se pegaron en un chat, un mail o una captura **están rotadas**.

**Aplicación**

- [ ] Todas las rutas exigen login (probaste en incógnito).
- [ ] **Rate limiting** en login y en cualquier ruta que llame a la IA o mande mensajes.
- [ ] Autenticación en dos pasos en GitHub, Supabase, Vercel, Railway y el proveedor de IA.
- [ ] HTTPS en todo (Vercel y Supabase lo dan por defecto).
- [ ] Los logs (Vercel, Railway) **no imprimen datos de pacientes**.
- [ ] Los previews de Vercel apuntan a un proyecto **sin datos reales**.

**Personas y normativa**

- [ ] Consultaste con un profesional del derecho cómo aplica la normativa de datos de salud de tu país.
- [ ] El paciente da su **consentimiento** para el tratamiento de sus datos y sabés cómo atender un pedido de acceso o de borrado.
- [ ] Sabés quién entra con qué rol y le diste a cada persona el rol **mínimo** que necesita.

---

## 8. Errores comunes y cómo resolverlos

| Qué ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| Las pantallas cargan pero **no hay datos**, sin error | RLS filtra todo: el usuario no tiene fila en `perfiles` | Creá la fila (3.4) con el UUID del usuario y un rol |
| `permission denied for table ...` (código `42501`) | Falta el `grant` para el rol `authenticated` | Corré el bloque de `grant` de 3.3 (Bloque E, paso 2) |
| `new row violates row-level security policy` | El rol del usuario no puede escribir ahí, o `profesional_id` no coincide con el del usuario | Revisá el rol en `perfiles` y la policy de esa tabla |
| `conflicting key value violates exclusion constraint "turnos_sin_solape"` | Dos turnos se pisan en el mismo sillón incluyendo montaje y esterilización | Es el comportamiento esperado: elegí otro horario u otro sillón |
| `invalid input syntax for type date: "10/04/2026"` | Mandaste la fecha en formato `dd/mm/aaaa` | Convertí a `aaaa-mm-dd` antes de insertar (función `fecha` del seed) |
| `Invalid API key` o `JWT` inválido | Mezclaste la URL de un proyecto con la clave de otro, o falta copiar la clave | Copiá URL y clave del **mismo** proyecto, en el panel de API |
| Funciona en local y en Vercel muestra todo vacío o falla | Faltan las variables `NEXT_PUBLIC_*` en Vercel, o las cambiaste y no redeployaste | Cargalas en Vercel (Production y Preview) y hacé **Redeploy** |
| El login funciona y te devuelve a `/login` en bucle | El `matcher` del middleware atrapa `/login`, o falta excluirlo | Revisá que el middleware deje pasar `/login` (3.9) |
| `getaddrinfo ENOTFOUND` o `ENETUNREACH` al conectar el worker | La conexión directa de Supabase es solo IPv6 y tu servidor no la alcanza | Usá la cadena del **pooler en modo sesión** (4.2) |
| `password authentication failed` en el worker | La contraseña de `DATABASE_URL` no es la de la base | Copiala de nuevo o restablecela en Supabase (Project Settings → Database) |
| pg-boss falla al arrancar por la versión de Node | Railway usa un Node anterior a 22.12 | Declará `engines.node` en el `package.json` y revisá el log del build |
| pg-boss: error porque la cola no existe | Llamaste a `send` o `schedule` sin `createQueue` | Agregá `await boss.createQueue("nombre")` antes de usarla |
| `Port 3000 is in use` | Otro programa usa el puerto | `npm run dev -- -p 3001` |
| El build de Vercel falla con `Type error` | Un nombre de columna o un tipo no coincide | Corré `npm run build` en tu compu y corregí el primer error que aparece |
| La IA responde `401` o `invalid api key` | Clave mal pegada, o la variable no llega al servidor | Revisá `OPENAI_API_KEY` o `GEMINI_API_KEY` en el entorno de **servidor** y redeployá |

---

## 9. Siguiente paso

Ya sabés cómo se convierte este demo en un sistema real. Lo que sigue es lo que cambia un proyecto de aprendizaje por un servicio que le podés vender a una clínica: elegir el nicho, armar la propuesta, implementar y conseguir tu primer cliente.

**Aprendé a crear tu Agencia de IA y conseguir tu primer cliente.** Eso lo trabajamos adentro del Club de la IA, nuestro Skool privado.

👉 https://www.skool.com/club-de-la-ia-8047/about
