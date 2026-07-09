"use client"
import { useEffect, useState } from "react"
import { PhoneCall, Clock } from "lucide-react"
import { getJornada, getProduccion, getProximos, getRecall, getOcupacion, type Proximo, type Recall, type Ocupacion } from "./api"
import { BarraEstadoJornada, type Jornada } from "@/shell/barra-jornada"
import { Donut, type Porcion } from "@/shell/donut"
import { chipRecall, nivelDeRecall } from "@/shell/dental"
import { theme } from "@/shell/theme"

// tablero-jornada · riel de proximos turnos + barra-estado-jornada + donut + recall.
// La agenda manda funcionalmente, pero el tablero es lo que mira el dueño una vez al dia.

function RielProximos({ proximos }: { proximos: Proximo[] }) {
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {proximos.map((p, i) => (
        <li
          key={p.id}
          className={
            "min-w-[11rem] shrink-0 rounded-xl border p-3 " +
            (i === 0 ? "border-primary bg-primary/5" : "border-border bg-subtle/40")
          }
        >
          <p className="dato flex items-center gap-1 text-xs font-bold">
            <Clock size={12} strokeWidth={1.5} className="text-muted" />
            {p.hora}
            {i === 0 && <span className="chip ml-auto bg-primary text-surface">en {p.minutosPara} min</span>}
          </p>
          <p className="mt-1 truncate text-[11px] font-semibold">{p.paciente}</p>
          <p className="truncate text-[10px] text-muted">{p.tratamiento}</p>
          <p className="mt-0.5 text-[10px] text-muted">{p.sillon}</p>
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
            <div className="flex items-baseline justify-between text-[11px]">
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
      <li className="pt-1 text-[10px] text-muted">
        Meta de ocupacion: {Math.round(theme.ocupacion.meta * 100)}% del sillon.
      </li>
    </ul>
  )
}

export function DashboardPage() {
  const [jornada, setJornada] = useState<Jornada | null>(null)
  const [produccion, setProduccion] = useState<Porcion[]>([])
  const [proximos, setProximos] = useState<Proximo[]>([])
  const [recall, setRecall] = useState<Recall[]>([])
  const [ocupacion, setOcupacion] = useState<Ocupacion[]>([])

  useEffect(() => {
    getJornada().then(setJornada)
    getProduccion().then(setProduccion)
    getProximos().then(setProximos)
    getRecall().then(setRecall)
    getOcupacion().then(setOcupacion)
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Panel general</h1>

      <div className="surface-card p-4">
        <h2 className="mb-2 font-heading text-sm font-bold">Proximos turnos</h2>
        {proximos.length ? <RielProximos proximos={proximos} /> : <div className="h-24 animate-pulse rounded-xl bg-subtle" />}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-4">
          {jornada ? <BarraEstadoJornada jornada={jornada} /> : <div className="h-28 animate-pulse rounded-xl bg-subtle" />}
        </div>

        <div className="surface-card p-4">
          <h2 className="mb-3 font-heading text-sm font-bold">Ocupacion del sillon</h2>
          {ocupacion.length ? <Ocupaciones datos={ocupacion} /> : <div className="h-28 animate-pulse rounded-xl bg-subtle" />}
        </div>

        <div className="surface-card p-4">
          <h2 className="mb-3 font-heading text-sm font-bold">Produccion del mes</h2>
          {produccion.length ? (
            <Donut porciones={produccion} unidad="tratamientos" />
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-subtle" />
          )}
        </div>
      </div>

      <div className="surface-card p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-heading text-sm font-bold">Seguimiento de pacientes</h2>
          <p className="text-[10px] text-muted">
            recall a los {theme.recall.alerta} dias · perdido a los {theme.recall.vencido}
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {recall.map((r) => {
            const nivel = nivelDeRecall(r.dias)
            return (
              <li key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-sm font-bold text-primary">
                  {r.paciente[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{r.paciente}</p>
                  <p className="truncate text-[10px] text-muted">{r.motivo}</p>
                  <p className="dato text-[10px] text-muted">{r.telefono}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={"chip " + chipRecall[nivel]}>{r.dias} d</span>
                  <PhoneCall size={14} strokeWidth={1.5} className="text-muted" />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
