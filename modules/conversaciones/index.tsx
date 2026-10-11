"use client"
import { useEffect, useState } from "react"
import { getHilos, type Hilo } from "./api"

// master-detail: hilos a la izquierda, conversacion a la derecha. Arquetipo de soporte.
// Cada hilo esta atado a un motivo clinico: nadie escribe "hola" y ya.

export function ConversacionesPage() {
  const [hilos, setHilos] = useState<Hilo[]>([])
  const [sel, setSel] = useState<string | null>(null)

  useEffect(() => {
    getHilos().then((hs) => {
      setHilos(hs)
      setSel(hs[0]?.id ?? null)
    })
  }, [])

  const hilo = hilos.find((h) => h.id === sel)
  const sinLeer = hilos.reduce((s, h) => s + h.sinLeer, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-[0.6875rem] text-muted">
          {hilos.length} hilos · <span className="text-accent-ink">{sinLeer} sin leer</span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[21rem_1fr]">
        <ul aria-label="Hilos de mensajes" className="surface-card max-h-[34rem] overflow-y-auto p-2">
          {hilos.map((h) => {
            const activo = h.id === sel
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => setSel(h.id)}
                  aria-current={activo ? "true" : undefined}
                  className={
                    "target w-full rounded-xl px-3 py-2 text-left transition-colors " +
                    (activo ? "bg-primary/10" : "hover:bg-subtle")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-xs font-semibold">{h.paciente}</p>
                    <span className="dato shrink-0 text-[0.6875rem] text-muted">{h.hora}</span>
                  </div>
                  <p className="truncate text-[0.6875rem] font-medium text-primary">{h.motivo}</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-[0.6875rem] text-muted">{h.ultimo}</p>
                    {h.sinLeer > 0 && (
                      <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[0.6875rem] font-bold text-fg">
                        {h.sinLeer}<span className="sr-only"> sin leer</span>
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="surface-card flex max-h-[34rem] flex-col">
          {hilo ? (
            <>
              <div className="border-b border-border px-4 py-3">
                <p className="font-heading text-sm font-bold">{hilo.paciente}</p>
                <p className="text-[0.6875rem] text-muted">
                  {hilo.motivo} · <span className="chip bg-subtle text-muted">{hilo.canal}</span>
                </p>
              </div>
              <div tabIndex={0} role="region" aria-label={`Conversación con ${hilo.paciente}`} className="flex-1 space-y-2 overflow-y-auto p-4">
                {hilo.mensajes.map((m) => (
                  <div key={m.id} className={"flex " + (m.de === "clinica" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[80%] rounded-2xl px-3 py-2 " +
                        (m.de === "clinica" ? "bg-primary/15 text-fg" : "bg-subtle text-fg")
                      }
                    >
                      <p className="text-[0.6875rem] leading-snug">
                        <span className="sr-only">{m.de === "clinica" ? "Clínica: " : "Paciente: "}</span>
                        {m.texto}
                      </p>
                      <p className="dato mt-0.5 text-right text-[0.6875rem] text-muted">{m.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-3">
                <input
                  disabled
                  aria-label="Escribir un mensaje (deshabilitado en el demo)"
                  placeholder="Demo frontend: el envío no está conectado"
                  className="target w-full rounded-xl border border-border bg-subtle px-3 py-2 text-xs text-muted"
                />
              </div>
            </>
          ) : (
            <p className="py-20 text-center text-xs text-muted">Elegí un hilo.</p>
          )}
        </div>
      </div>
    </div>
  )
}
