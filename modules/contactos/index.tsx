"use client"
import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { getPacientes, type Paciente } from "./api"
import { chipOS, chipRecall, nivelDeRecall } from "@/shell/dental"

// tabla-densa: el padron de pacientes. Arquetipo de soporte, no el protagonista.
// El protagonista es el odontograma. Aca recepcion busca a quien hay que llamar.

export function ContactosPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    getPacientes().then(setPacientes)
  }, [])

  const visibles = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q.toLowerCase()) ||
      p.obraSocial.toLowerCase().includes(q.toLowerCase()),
  )
  const aLlamar = pacientes.filter((p) => nivelDeRecall(p.diasDesdeVisita) !== "al dia").length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-[11px] text-muted">
            {pacientes.length} en el padron · <span className="text-warning">{aLlamar} para llamar</span>
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre u obra social"
          className="target w-72 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg outline-none placeholder:text-muted focus:border-primary"
        />
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[54rem] text-left">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5 font-semibold">Paciente</th>
              <th className="px-4 py-2.5 font-semibold">Contacto</th>
              <th className="px-4 py-2.5 font-semibold">Obra social</th>
              <th className="px-4 py-2.5 font-semibold">Autorizacion</th>
              <th className="px-4 py-2.5 font-semibold">Ultima visita</th>
              <th className="px-4 py-2.5 font-semibold">Recall</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-subtle">
                <td className="px-4 py-2">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-[11px] font-bold text-primary">
                      {p.nombre[0]}
                    </span>
                    <span>
                      <span className="block text-xs font-semibold">{p.nombre}</span>
                      <span className="dato block text-[10px] text-muted">{p.edad} años</span>
                    </span>
                    {p.alertas > 0 && (
                      <span
                        title={`${p.alertas} alerta(s) medica(s)`}
                        className="chip bg-danger/15 text-danger"
                      >
                        <AlertTriangle size={10} strokeWidth={1.5} /> {p.alertas}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <p className="dato text-[11px]">{p.telefono}</p>
                  <p className="truncate text-[10px] text-muted">{p.email}</p>
                </td>
                <td className="px-4 py-2 text-[11px] text-muted">{p.obraSocial}</td>
                <td className="px-4 py-2">
                  <span className={"chip " + chipOS[p.estadoOS]}>{p.estadoOS}</span>
                </td>
                <td className="dato px-4 py-2 text-[11px] text-muted">{p.ultimaVisita}</td>
                <td className="px-4 py-2">
                  <span className={"chip " + chipRecall[nivelDeRecall(p.diasDesdeVisita)]}>
                    {p.diasDesdeVisita} d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibles.length && <p className="py-10 text-center text-xs text-muted">Sin resultados.</p>}
      </div>
    </div>
  )
}
