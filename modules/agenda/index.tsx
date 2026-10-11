"use client"
import { useState } from "react"
import Link from "next/link"
import { Armchair, Ban, CalendarCheck, Check, UserX, type LucideIcon } from "lucide-react"
import { getSillones, getDentistas, getTurnosDia, APERTURA, CIERRE, AHORA, type Turno } from "./api"
import { theme } from "@/shell/theme"
import { chipTurno, bandaAtencion, hhmm, ESTADOS_TURNO, type EstadoTurno } from "@/shell/dental"
import { Esqueleto, ErrorCarga, useCarga } from "@/shell/carga"
import { AvisoDemo, DatoFicha, FichaLateral, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"

// agenda-sillon-ciclo · ARQUETIPO DE DATOS NUEVO.
// No es la `grilla-semana` de la barberia con las columnas renombradas. Tres cosas la
// separan, y las tres son estructurales, no cosmeticas:
//   1. UN solo dia. Las columnas son SILLONES fisicos, no dias.
//   2. Eje Y de tiempo CONTINUO (minutos), no slots fijos. Un turno de 90 min ocupa
//      exactamente 90 min de alto, y un hueco de 23 min se ve como un hueco de 23 min.
//   3. Cada bloque es TRI-BANDA: montaje / atencion / esterilizacion. Codifica el ciclo
//      del box, no un binario ocupado/libre. El sillon sigue tomado mientras se esteriliza.
// Y un riel de color por dentista ata sus bloques ENTRE columnas: cuando el mismo
// profesional atiende en dos sillones, la dependencia se ve cruzando la grilla.
// El turno se abre en una ficha lateral (FichaLateral) con acciones de demo: nada se guarda.

const MINUTOS = CIERRE - APERTURA
// rem de alto de la pista completa. 38 rem = ~0,92 px por minuto: un turno de 20 min mide ~46 px
// con su montaje y esterilizacion (>= 44 px) y su banda de atencion entra una linea de texto.
const ALTO = 38
// Bajo este umbral (min) la banda de atencion es de una sola linea: solo el paciente.
const TURNO_CORTO = 40

// Tailwind no ve `border-l-${x}`: mapa literal, uno por dentista.
const rielDentista: Record<string, string> = {
  D1: "border-l-primary",
  D2: "border-l-accent",
  D3: "border-l-info",
}
const puntoDentista: Record<string, string> = {
  D1: "bg-primary",
  D2: "bg-accent",
  D3: "bg-info",
}

// El estado del turno NO viaja solo en el tinte de la banda (cinco /20 casi iguales): cada
// uno lleva un icono. Mapa literal, igual que el resto de los tonos.
const iconoTurno: Record<EstadoTurno, LucideIcon> = {
  atendido: Check,
  "en sala": Armchair,
  confirmado: CalendarCheck,
  ausente: UserX,
  cancelado: Ban,
}

const pct = (min: number) => ((min - APERTURA) / MINUTOS) * 100

const cargarAgenda = () => Promise.all([getSillones(), getDentistas(), getTurnosDia("hoy")])
const SIN_DATOS: Awaited<ReturnType<typeof cargarAgenda>> = [[], [], []]

function BloqueTurno({
  t,
  profesional,
  onSeleccionar,
  seleccionado,
}: {
  t: Turno
  profesional?: string
  onSeleccionar: () => void
  seleccionado: boolean
}) {
  const Icono = iconoTurno[t.estado]
  // El bloque ocupa el sillon durante montaje + atencion + esterilizacion.
  const { montaje, esterilizacion } = theme.ciclo
  const total = montaje + t.duracion + esterilizacion
  const top = pct(t.inicio - montaje)
  const alto = (total / MINUTOS) * 100
  const corto = t.duracion < TURNO_CORTO

  // Proporcion de cada banda dentro del bloque.
  const fr = (m: number) => (m / total) * 100

  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-haspopup="dialog"
      aria-label={`${t.paciente}, ${hhmm(t.inicio)}, ${t.tratamiento}, ${t.estado}${profesional ? ", " + profesional : ""}`}
      style={{ top: top + "%", height: alto + "%" }}
      className={
        "absolute inset-x-0.5 flex flex-col overflow-hidden rounded-lg border-l-[3px] text-left transition-shadow hover:shadow-pop " +
        rielDentista[t.dentistaId] +
        (seleccionado ? " shadow-pop ring-1 ring-primary" : "") +
        (t.estado === "ausente" ? " turno-ausente" : "")
      }
    >
      {/* banda de montaje: el sillon ya esta tomado, pero no se atiende */}
      <span className="trama shrink-0 bg-subtle" style={{ height: fr(montaje) + "%" }} />

      {/* banda de atencion: el color del estado del turno */}
      <span
        className={"min-h-0 flex-1 overflow-hidden px-1.5 " + (corto ? "py-0 " : "py-1 ") + bandaAtencion[t.estado]}
        style={{ height: fr(t.duracion) + "%" }}
      >
        <span className="flex items-center justify-between gap-1">
          <span className="block truncate text-xs font-semibold leading-4">{t.paciente}</span>
          <Icono aria-hidden size={12} strokeWidth={2} className="shrink-0" />
        </span>
        {!corto && (
          <span className="dato block truncate text-xs leading-4 text-fg/80">
            {hhmm(t.inicio)} · {t.tratamiento}
          </span>
        )}
      </span>

      {/* banda de esterilizacion: el sillon sigue tomado despues de que el paciente se fue */}
      <span className="trama shrink-0 bg-subtle" style={{ height: fr(esterilizacion) + "%" }} />
    </button>
  )
}

// Acciones de la ficha del turno segun su estado. Ninguna guarda nada: usan el aviso de demo.
type Accion = { id: string; rotulo: string; aviso: (paciente: string) => string }
const ACCIONES: Record<string, Accion> = {
  recordatorio: {
    id: "recordatorio",
    rotulo: "Enviar recordatorio",
    aviso: (p) => `Demo: no se guardó nada. Se habría enviado un recordatorio a ${p}.`,
  },
  atender: {
    id: "atender",
    rotulo: "Marcar como atendido",
    aviso: (p) => `Demo: no se guardó nada. El turno de ${p} quedaría atendido.`,
  },
  reprogramar: {
    id: "reprogramar",
    rotulo: "Reprogramar",
    aviso: (p) => `Demo: no se guardó nada. Se abriría la grilla para reprogramar a ${p}.`,
  },
  contactar: {
    id: "contactar",
    rotulo: "Contactar al paciente",
    aviso: (p) => `Demo: no se guardó nada. Se registraría el llamado a ${p}.`,
  },
}
const accionesDe = (e: EstadoTurno): Accion[] => {
  if (e === "confirmado") return [ACCIONES.recordatorio, ACCIONES.reprogramar]
  if (e === "en sala") return [ACCIONES.atender]
  if (e === "ausente") return [ACCIONES.contactar, ACCIONES.reprogramar]
  if (e === "cancelado") return [ACCIONES.reprogramar]
  return []
}

export function AgendaPage() {
  const { data, error, cargando, reintentar } = useCarga(cargarAgenda)
  const [sel, setSel] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const [sillones, dentistas, turnos] = data ?? SIN_DATOS
  const turno = turnos.find((t) => t.id === sel)
  const horas = Array.from({ length: (CIERRE - APERTURA) / 60 + 1 }, (_, i) => APERTURA + i * 60)

  const ausentes = turnos.filter((t) => t.estado === "ausente").length
  const activos = turnos.filter((t) => t.estado !== "cancelado").length
  const tasaAusencia = activos ? ausentes / activos : 0
  const alarma = tasaAusencia >= theme.noShow.alerta

  const abrir = (id: string) => {
    setSel(id)
    setAviso(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-xs text-muted">
            Hoy. Cada columna es un sillón. El bloque ocupa montaje + atención + esterilización.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {dentistas.map((d) => (
            <span key={d.id} className="flex items-center gap-1.5 text-xs text-muted">
              <span aria-hidden className={"h-2.5 w-2.5 rounded-full " + puntoDentista[d.id]} />
              {d.nombre}
            </span>
          ))}
          {!cargando && !error && (
            <span className="flex items-center gap-2">
              <span className={"chip " + (alarma ? "bg-danger/15 text-danger" : "bg-success/15 text-success")}>
                {Math.round(tasaAusencia * 100)}% de ausentismo
              </span>
              <span className="text-xs text-muted">
                alarma desde {Math.round(theme.noShow.alerta * 100)}%
              </span>
            </span>
          )}
        </div>
      </div>

      {error ? (
        <ErrorCarga onReintentar={reintentar} />
      ) : (
        <section aria-busy={cargando} aria-label="Grilla de turnos por sillón" className="surface-card p-4">
          {cargando ? (
            <Esqueleto className="h-[38rem]" />
          ) : (
            <>
              <p className="mb-2 text-xs text-muted md:hidden">Deslizá hacia el costado para ver los demás sillones.</p>
              <div tabIndex={0} role="region" aria-label="Grilla de turnos (se desplaza con las flechas)" className="overflow-x-auto">
                <div className="flex min-w-[44rem] gap-2">
                  {/* eje de horas: continuo, no slots.
                      El espaciador replica el alto del rotulo "Sillon N" de las columnas:
                      sin el, el eje corre mas arriba que los bloques y las horas mienten. */}
                  <div className="w-12 shrink-0">
                    <p aria-hidden className="mb-1.5 select-none text-center text-xs font-semibold text-transparent">
                      .
                    </p>
                    <div className="relative" style={{ height: ALTO + "rem" }}>
                      {horas.map((m) => (
                        <span
                          key={m}
                          style={{ top: pct(m) + "%" }}
                          className="dato absolute right-1 -translate-y-1/2 text-xs text-muted"
                        >
                          {hhmm(m)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {sillones.map((s) => (
                    <div key={s.id} className="flex-1">
                      <p className="mb-1.5 text-center text-xs font-semibold text-muted">{s.nombre}</p>
                      <div role="group" aria-label={s.nombre} className="relative rounded-xl bg-subtle/50" style={{ height: ALTO + "rem" }}>
                        {/* reglas horarias */}
                        {horas.map((m) => (
                          <span
                            key={m}
                            style={{ top: pct(m) + "%" }}
                            className="absolute inset-x-0 h-px bg-border"
                          />
                        ))}

                        {turnos
                          .filter((t) => t.sillonId === s.id)
                          .map((t) => (
                            <BloqueTurno
                              key={t.id}
                              t={t}
                              profesional={dentistas.find((d) => d.id === t.dentistaId)?.nombre}
                              seleccionado={sel === t.id}
                              onSeleccionar={() => abrir(t.id)}
                            />
                          ))}

                        {/* la linea de AHORA: hora fija de la demo (ver AHORA en api.ts) */}
                        <span
                          aria-hidden
                          style={{ top: pct(AHORA) + "%" }}
                          className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-accent"
                        >
                          <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="trama h-3 w-5 rounded bg-subtle" /> montaje / esterilización
                </span>
                {ESTADOS_TURNO.map((e) => {
                  const Icono = iconoTurno[e]
                  return (
                    <span key={e} className="flex items-center gap-1.5">
                      <span className={"flex h-3 w-5 items-center justify-center rounded text-fg " + bandaAtencion[e]}>
                        <Icono aria-hidden size={10} strokeWidth={2} />
                      </span>{" "}
                      {e}
                    </span>
                  )
                })}
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="h-3 w-0.5 bg-accent" /> ahora ({hhmm(AHORA)})
                </span>
              </div>
            </>
          )}
        </section>
      )}

      <FichaLateral
        abierta={!!turno}
        titulo={turno?.paciente ?? ""}
        subtitulo={turno ? `Turno ${turno.id} · ${hhmm(turno.inicio)} a ${hhmm(turno.inicio + turno.duracion)}` : undefined}
        onCerrar={() => setSel(null)}
        acciones={
          turno && (
            <>
              {accionesDe(turno.estado).map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  className={i === 0 ? botonPrimario : botonSecundario}
                  onClick={() => setAviso(a.aviso(turno.paciente))}
                >
                  {a.rotulo}
                </button>
              ))}
              <Link href={"/ordenes?ficha=" + turno.fichaId} className={botonSecundario}>
                Abrir ficha clínica
              </Link>
            </>
          )
        }
      >
        {turno && (
          <>
            <span className={"chip " + chipTurno[turno.estado]}>{turno.estado}</span>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <DatoFicha etiqueta="Tratamiento">{turno.tratamiento}</DatoFicha>
              <DatoFicha etiqueta="Obra social">{turno.obraSocial}</DatoFicha>
              <DatoFicha etiqueta="Sillón">{sillones.find((s) => s.id === turno.sillonId)?.nombre}</DatoFicha>
              <DatoFicha etiqueta="Profesional">{dentistas.find((d) => d.id === turno.dentistaId)?.nombre}</DatoFicha>
              <DatoFicha etiqueta="Horario">
                <span className="dato">{hhmm(turno.inicio)} a {hhmm(turno.inicio + turno.duracion)}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Duración">
                <span className="dato">{turno.duracion} min</span>
              </DatoFicha>
              <DatoFicha etiqueta="Ciclo del sillón">
                <span className="dato">
                  {theme.ciclo.montaje} + {turno.duracion} + {theme.ciclo.esterilizacion} min
                </span>
              </DatoFicha>
              <DatoFicha etiqueta="Ficha clínica">
                <span className="dato">{turno.fichaId}</span>
              </DatoFicha>
            </dl>
            {turno.estado === "ausente" && (
              <p className="mt-4 rounded-xl bg-danger/10 p-3 text-xs leading-snug text-danger">
                No vino. El sillón quedó vacío {turno.duracion} minutos: esa hora no se recupera.
              </p>
            )}
            <AvisoDemo texto={aviso} />
          </>
        )}
      </FichaLateral>
    </div>
  )
}
