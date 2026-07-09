"use client"
import { useEffect, useState } from "react"
import { getSillones, getDentistas, getTurnosDia, APERTURA, CIERRE, type Sillon, type Dentista, type Turno } from "./api"
import { theme } from "@/shell/theme"
import { chipTurno, bandaAtencion, hhmm } from "@/shell/dental"

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

const MINUTOS = CIERRE - APERTURA
const ALTO = 30 // rem de alto de la pista completa

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

const pct = (min: number) => ((min - APERTURA) / MINUTOS) * 100

function BloqueTurno({
  t,
  onSeleccionar,
  seleccionado,
}: {
  t: Turno
  onSeleccionar: () => void
  seleccionado: boolean
}) {
  // El bloque ocupa el sillon durante montaje + atencion + esterilizacion.
  const { montaje, esterilizacion } = theme.ciclo
  const total = montaje + t.duracion + esterilizacion
  const top = pct(t.inicio - montaje)
  const alto = (total / MINUTOS) * 100

  // Proporcion de cada banda dentro del bloque.
  const fr = (m: number) => (m / total) * 100

  return (
    <button
      onClick={onSeleccionar}
      style={{ top: top + "%", height: alto + "%" }}
      className={
        "absolute inset-x-0.5 flex flex-col overflow-hidden rounded-lg border-l-[3px] text-left transition-shadow " +
        rielDentista[t.dentistaId] +
        (seleccionado ? " shadow-pop ring-1 ring-primary" : " hover:shadow-pop") +
        (t.estado === "ausente" ? " turno-ausente" : "")
      }
    >
      {/* banda de montaje: el sillon ya esta tomado, pero no se atiende */}
      <span className="trama shrink-0 bg-subtle" style={{ height: fr(montaje) + "%" }} />

      {/* banda de atencion: el color del estado del turno */}
      <span
        className={"min-h-0 flex-1 px-1.5 py-1 " + bandaAtencion[t.estado]}
        style={{ height: fr(t.duracion) + "%" }}
      >
        <span className="block truncate text-[11px] font-semibold leading-tight">{t.paciente}</span>
        <span className="dato block truncate text-[10px] text-muted">
          {hhmm(t.inicio)} · {t.tratamiento}
        </span>
      </span>

      {/* banda de esterilizacion: el sillon sigue tomado despues de que el paciente se fue */}
      <span className="trama shrink-0 bg-subtle" style={{ height: fr(esterilizacion) + "%" }} />
    </button>
  )
}

export function AgendaPage() {
  const [sillones, setSillones] = useState<Sillon[]>([])
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [ahora, setAhora] = useState<number | null>(null)

  useEffect(() => {
    getSillones().then(setSillones)
    getDentistas().then(setDentistas)
    getTurnosDia("hoy").then(setTurnos)
  }, [])

  // Reloj en vivo: SIEMPRE en useEffect, nunca en el render del server, o rompe la
  // hidratacion. Y clampeado al rango util, para que el frame se vea bien a cualquier hora.
  useEffect(() => {
    const leer = () => {
      const d = new Date()
      const m = d.getHours() * 60 + d.getMinutes()
      setAhora(Math.min(Math.max(m, APERTURA + 45), CIERRE - 45))
    }
    leer()
    const t = setInterval(leer, 30000)
    return () => clearInterval(t)
  }, [])

  const turno = turnos.find((t) => t.id === sel)
  const horas = Array.from({ length: (CIERRE - APERTURA) / 60 + 1 }, (_, i) => APERTURA + i * 60)

  const ausentes = turnos.filter((t) => t.estado === "ausente").length
  const activos = turnos.filter((t) => t.estado !== "cancelado").length
  const tasaAusencia = activos ? ausentes / activos : 0
  const alarma = tasaAusencia >= theme.noShow.alerta

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Agenda de hoy</h1>
          <p className="text-[11px] text-muted">
            Cada columna es un sillon. El bloque ocupa montaje + atencion + esterilizacion.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {dentistas.map((d) => (
            <span key={d.id} className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className={"h-2.5 w-2.5 rounded-full " + puntoDentista[d.id]} />
              {d.nombre}
            </span>
          ))}
          <span
            className={
              "chip " + (alarma ? "bg-danger/15 text-danger" : "bg-success/15 text-success")
            }
          >
            {Math.round(tasaAusencia * 100)}% de ausentismo
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_17rem]">
        <div className="surface-card overflow-x-auto p-4">
          <div className="flex min-w-[44rem] gap-2">
            {/* eje de horas: continuo, no slots */}
            <div className="relative w-12 shrink-0" style={{ height: ALTO + "rem" }}>
              {horas.map((m) => (
                <span
                  key={m}
                  style={{ top: pct(m) + "%" }}
                  className="dato absolute right-1 -translate-y-1/2 text-[10px] text-muted"
                >
                  {hhmm(m)}
                </span>
              ))}
            </div>

            {sillones.map((s) => (
              <div key={s.id} className="flex-1">
                <p className="mb-1.5 text-center text-[11px] font-semibold text-muted">{s.nombre}</p>
                <div className="relative rounded-xl bg-subtle/50" style={{ height: ALTO + "rem" }}>
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
                        seleccionado={sel === t.id}
                        onSeleccionar={() => setSel(t.id)}
                      />
                    ))}

                  {/* la linea de AHORA, calculada en cliente */}
                  {ahora !== null && (
                    <span
                      style={{ top: pct(ahora) + "%" }}
                      className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-accent"
                    >
                      <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3 text-[10px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="trama h-3 w-5 rounded bg-subtle" /> montaje / esterilizacion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded bg-success/20" /> atencion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-accent" /> ahora
            </span>
          </div>
        </div>

        {/* panel del turno seleccionado */}
        <div className="surface-card p-4">
          <h2 className="mb-3 font-heading text-sm font-bold">Turno</h2>
          {turno ? (
            <div className="space-y-3">
              <div>
                <p className="font-heading text-base font-bold leading-tight">{turno.paciente}</p>
                <p className="dato text-[11px] text-muted">
                  {hhmm(turno.inicio)} a {hhmm(turno.inicio + turno.duracion)} · {turno.duracion} min
                </p>
              </div>
              <span className={"chip " + chipTurno[turno.estado]}>{turno.estado}</span>
              <dl className="space-y-1.5 border-t border-border pt-3 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Tratamiento</dt>
                  <dd className="text-right font-medium">{turno.tratamiento}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Obra social</dt>
                  <dd className="text-right font-medium">{turno.obraSocial}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Profesional</dt>
                  <dd className="text-right font-medium">
                    {dentistas.find((d) => d.id === turno.dentistaId)?.nombre}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Ficha</dt>
                  <dd className="dato text-right font-medium">{turno.fichaId}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Ciclo del sillon</dt>
                  <dd className="dato text-right font-medium">
                    {theme.ciclo.montaje} + {turno.duracion} + {theme.ciclo.esterilizacion} min
                  </dd>
                </div>
              </dl>
              {turno.estado === "ausente" && (
                <p className="rounded-xl bg-danger/10 p-2 text-[11px] leading-snug text-danger">
                  No vino. El sillon quedo vacio {turno.duracion} minutos: esa hora no se recupera.
                </p>
              )}
            </div>
          ) : (
            <p className="py-10 text-center text-[11px] text-muted">Elegi un turno de la grilla.</p>
          )}
        </div>
      </div>
    </div>
  )
}
