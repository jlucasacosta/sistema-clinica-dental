"use client"
import { PhoneCall, Clock } from "lucide-react"
import { getJornada, getProduccion, getProximos, getRecall, getOcupacion, type Proximo, type Recall, type Ocupacion } from "./api"
import { BarraEstadoJornada } from "@/shell/barra-jornada"
import { Donut } from "@/shell/donut"
import { chipRecall, nivelDeRecall } from "@/shell/dental"
import { Esqueleto, ErrorCarga, useCarga } from "@/shell/carga"
import { theme } from "@/shell/theme"

// tablero-jornada · riel de proximos turnos + barra-estado-jornada + donut + recall.
// La agenda manda funcionalmente, pero el tablero es lo que mira el dueño una vez al dia.
// Todo se carga junto: si falla una consulta, el tablero entero ofrece reintentar.

const cargarTablero = () =>
  Promise.all([getJornada(), getProduccion(), getProximos(), getRecall(), getOcupacion()])

function RielProximos({ proximos }: { proximos: Proximo[] }) {
  return (
    <ul tabIndex={0} aria-label="Próximos turnos (se desplaza con las flechas)" className="flex gap-2 overflow-x-auto pb-1">
      {proximos.map((p, i) => (
        <li
          key={p.id}
          className={
            "min-w-[11rem] shrink-0 rounded-xl border p-3 " +
            (i === 0 ? "border-primary bg-primary/5" : "border-border bg-subtle/40")
          }
        >
          <p className="dato flex items-center gap-1 text-xs font-bold">
            <Clock size={12} strokeWidth={1.5} className="text-muted" aria-hidden />
            {p.hora}
            {i === 0 && <span className="chip ml-auto bg-primary text-surface">en {p.minutosPara} min</span>}
          </p>
          <p className="mt-1 truncate text-xs font-semibold">{p.paciente}</p>
          <p className="truncate text-xs text-muted">{p.tratamiento}</p>
          <p className="mt-0.5 text-xs text-muted">{p.sillon}</p>
        </li>
      ))}
    </ul>
  )
}

function Ocupaciones({ datos }: { datos: Ocupacion[] }) {
  return (
    <ul className="space-y-2.5">
      {datos.map((o) => {
        const frac = o.ocupado / o.disponible
        const cumple = frac >= theme.ocupacion.meta
        return (
          <li key={o.sillon}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted">{o.sillon}</span>
              <span className={"dato font-semibold " + (cumple ? "text-success" : "text-warning")}>
                {Math.round(frac * 100)}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className={"h-full rounded-full " + (cumple ? "bg-success" : "bg-warning")}
                style={{ width: Math.round(frac * 100) + "%" }}
              />
            </div>
          </li>
        )
      })}
      <li className="pt-1 text-xs text-muted">
        Verde: alcanza la meta de {Math.round(theme.ocupacion.meta * 100)}% del sillón. Ámbar: está por debajo.
      </li>
    </ul>
  )
}

function Seguimiento({ recall }: { recall: Recall[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {recall.map((r) => {
        const nivel = nivelDeRecall(r.dias)
        // Estar en esta lista YA es un motivo de contacto (plan sin terminar,
        // protesis sin retirar). Un chip verde "al dia" al lado de "conducto sin
        // terminar" dice lo contrario de lo que pasa: el piso es warning.
        const chip = nivel === "al dia" ? /* ortografia-ok */ "bg-warning/15 text-warning" : chipRecall[nivel]
        return (
          <li key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-sm font-bold text-primary">
              {r.paciente[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{r.paciente}</p>
              <p className="truncate text-xs text-muted">{r.motivo}</p>
              <p className="dato text-xs text-muted">{r.telefono}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={"chip " + chip}>
                {r.dias} d<span className="sr-only"> desde la última visita</span>
              </span>
              <PhoneCall aria-hidden size={14} strokeWidth={1.5} className="text-muted" />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function DashboardPage() {
  const { data, error, cargando, reintentar } = useCarga(cargarTablero)
  const [jornada, produccion, proximos, recall, ocupacion] = data ?? []

  // Nunca un 0 falso mientras llegan los datos: el total es "—".
  const totalTurnos = jornada ? Object.values(jornada).reduce((s, n) => s + n, 0) : null

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Panel</h1>

      {error ? (
        <ErrorCarga onReintentar={reintentar} />
      ) : (
        <>
          <section aria-busy={cargando} aria-labelledby="t-proximos" className="surface-card p-4">
            <h2 id="t-proximos" className="mb-2 font-heading text-sm font-bold">Próximos turnos</h2>
            {proximos ? <RielProximos proximos={proximos} /> : <Esqueleto className="h-24" />}
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <section aria-busy={cargando} aria-labelledby="t-jornada" className="surface-card p-4">
              <div className="flex items-baseline justify-between">
                <h2 id="t-jornada" className="text-xs uppercase tracking-wide text-muted">Turnos de hoy</h2>
                <p className="dato font-heading text-2xl font-bold leading-none">{totalTurnos ?? "—"}</p>
              </div>
              {jornada ? <BarraEstadoJornada jornada={jornada} /> : <Esqueleto className="mt-2 h-24" />}
            </section>

            <section aria-busy={cargando} aria-labelledby="t-ocupacion" className="surface-card p-4">
              <h2 id="t-ocupacion" className="mb-3 font-heading text-sm font-bold">Ocupación del sillón</h2>
              {ocupacion ? <Ocupaciones datos={ocupacion} /> : <Esqueleto className="h-36" />}
            </section>

            <section aria-busy={cargando} aria-labelledby="t-produccion" className="surface-card p-4">
              <h2 id="t-produccion" className="mb-3 font-heading text-sm font-bold">Producción del mes</h2>
              {produccion ? <Donut porciones={produccion} unidad="tratamientos" /> : <Esqueleto className="h-40" />}
            </section>
          </div>

          <section aria-busy={cargando} aria-labelledby="t-seguimiento" className="surface-card p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1">
              <h2 id="t-seguimiento" className="font-heading text-sm font-bold">Seguimiento de pacientes</h2>
              <p className="text-xs text-muted">
                Días desde la última visita: a llamar desde los {theme.recall.alerta}, perdido desde los {theme.recall.vencido}.
              </p>
            </div>
            {recall ? <Seguimiento recall={recall} /> : <Esqueleto className="h-48" />}
          </section>
        </>
      )}
    </div>
  )
}
