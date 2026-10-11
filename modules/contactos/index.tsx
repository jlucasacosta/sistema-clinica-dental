"use client"
import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { getPacientes, type Paciente } from "./api"
import { chipOS, chipRecall, nivelDeRecall, rotuloOS } from "@/shell/dental"

// tabla-densa: el padron de pacientes. Arquetipo de soporte, no el protagonista.
// El protagonista es el odontograma. Aca recepcion busca a quien hay que llamar.

// Busqueda sin tildes ni mayusculas: "circulo" encuentra "Círculo Salud".
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export function ContactosPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    getPacientes().then(setPacientes)
  }, [])

  const visibles = pacientes.filter(
    (p) =>
      norm(p.nombre).includes(norm(q)) || norm(p.obraSocial).includes(norm(q)),
  )
  const aLlamar = pacientes.filter((p) => nivelDeRecall(p.diasDesdeVisita) !== "al dia").length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-[0.6875rem] text-muted">
            {pacientes.length} en el padrón · <span className="text-warning">{aLlamar} para llamar</span>
          </p>
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar paciente por nombre u obra social"
          placeholder="Buscar por nombre u obra social"
          className="target w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg placeholder:text-muted focus:border-primary sm:w-72"
        />
      </div>

      <div tabIndex={0} role="region" aria-label="Tabla de pacientes (se desplaza con las flechas)" className="surface-card overflow-x-auto">
        <table className="w-full min-w-[54rem] text-left">
          <caption className="sr-only">Padrón de pacientes con obra social, última visita y recall</caption>
          <thead>
            <tr className="border-b border-border text-[0.6875rem] uppercase tracking-wide text-muted">
              <th scope="col" className="px-4 py-2.5 font-semibold">Paciente</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Contacto</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Obra social</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Autorización</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Última visita</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Recall</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-subtle">
                <td className="px-4 py-2">
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-[0.6875rem] font-bold text-primary">
                      {p.nombre[0]}
                    </span>
                    <span>
                      <span className="block text-xs font-semibold">{p.nombre}</span>
                      <span className="dato block text-[0.6875rem] text-muted">{p.edad} años</span>
                    </span>
                    {p.alertas > 0 && (
                      <span
                        title={`${p.alertas} alerta(s) médica(s)`}
                        className="chip bg-danger/15 text-danger"
                      >
                        <AlertTriangle aria-hidden size={10} strokeWidth={1.5} /> {p.alertas}
                        <span className="sr-only"> alerta(s) médica(s)</span>
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <p className="dato text-[0.6875rem]">{p.telefono}</p>
                  <p className="truncate text-[0.6875rem] text-muted">{p.email}</p>
                </td>
                <td className="px-4 py-2 text-[0.6875rem] text-muted">{p.obraSocial}</td>
                <td className="px-4 py-2">
                  <span className={"chip " + chipOS[p.estadoOS]}>{rotuloOS[p.estadoOS]}</span>
                </td>
                <td className="dato px-4 py-2 text-[0.6875rem] text-muted">{p.ultimaVisita}</td>
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
