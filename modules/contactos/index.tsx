"use client"
import { useState } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { getPacientes, type Paciente } from "./api"
import { chipOS, chipRecall, nivelDeRecall, rotuloOS, rotuloRecall } from "@/shell/dental"
import { Esqueleto, ErrorCarga, useCarga } from "@/shell/carga"
import { AvisoDemo, DatoFicha, FichaLateral, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"
import { theme } from "@/shell/theme"

// tabla-densa: el padron de pacientes. Arquetipo de soporte, no el protagonista.
// El protagonista es el odontograma. Aca recepcion busca a quien hay que llamar.
// El nombre de cada fila es un boton que abre la ficha del paciente (FichaLateral); el clic en
// toda la fila es un extra para el mouse. Las acciones de la ficha son de demo: no guardan nada.

// Busqueda sin tildes ni mayusculas: "circulo" encuentra "Círculo Salud".
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export function ContactosPage() {
  const { data, error, cargando, reintentar } = useCarga(getPacientes)
  const [q, setQ] = useState("")
  const [sel, setSel] = useState<Paciente | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const pacientes = data ?? []
  const visibles = pacientes.filter(
    (p) =>
      norm(p.nombre).includes(norm(q)) || norm(p.obraSocial).includes(norm(q)) || norm(p.id).includes(norm(q)),
  )
  const aLlamar = pacientes.filter((p) => nivelDeRecall(p.diasDesdeVisita) !== "al dia").length // ortografia-ok: valor del enum

  const abrir = (p: Paciente) => {
    setSel(p)
    setAviso(null)
  }

  const nivelSel = sel ? nivelDeRecall(sel.diasDesdeVisita) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-xs text-muted">
            {cargando ? "—" : pacientes.length} en el padrón ·{" "}
            <span className="text-warning">{cargando ? "—" : aLlamar} para llamar</span>
          </p>
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar paciente por nombre, código u obra social"
          placeholder="Buscar por nombre u obra social"
          className="target w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-primary sm:w-72"
        />
      </div>

      <p className="text-xs text-muted">
        Recall = días desde la última visita: <span className="font-semibold text-success">al día</span> con menos de{" "}
        {theme.recall.alerta} días · <span className="font-semibold text-warning">a llamar</span> desde los{" "}
        {theme.recall.alerta} · <span className="font-semibold text-danger">perdido</span> desde los {theme.recall.vencido}.
      </p>

      {error ? (
        <ErrorCarga onReintentar={reintentar} />
      ) : (
        <section
          aria-busy={cargando}
          aria-label="Padrón de pacientes"
          tabIndex={0}
          role="region"
          className="surface-card overflow-x-auto"
        >
          {cargando ? (
            <Esqueleto className="m-4 h-96" />
          ) : (
            <table className="w-full text-left md:min-w-[54rem]">
              <caption className="sr-only">Padrón de pacientes con obra social, última visita y recall</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Paciente</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-semibold md:table-cell">Contacto</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-semibold md:table-cell">Obra social</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Autorización</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-semibold md:table-cell">Última visita</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Recall</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => {
                  const nivel = nivelDeRecall(p.diasDesdeVisita)
                  return (
                    <tr
                      key={p.id}
                      onClick={() => abrir(p)}
                      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-subtle"
                    >
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-2.5">
                          <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-xs font-bold text-primary">
                            {p.nombre[0]}
                          </span>
                          <span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                abrir(p)
                              }}
                              aria-haspopup="dialog"
                              className="target block text-left text-sm font-semibold hover:text-primary"
                            >
                              {p.nombre}
                            </button>
                            <span className="dato block text-xs text-muted">
                              {p.id} · {p.edad} años
                            </span>
                          </span>
                          {p.alertas > 0 && (
                            <span className="chip bg-danger/15 text-danger">
                              <AlertTriangle aria-hidden size={12} strokeWidth={1.5} /> {p.alertas}
                              <span className="sr-only"> alerta(s) médica(s)</span>
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="hidden px-4 py-2 md:table-cell">
                        <p className="dato text-xs">{p.telefono}</p>
                        <p className="truncate text-xs text-muted">{p.email}</p>
                      </td>
                      <td className="hidden px-4 py-2 text-xs text-muted md:table-cell">{p.obraSocial}</td>
                      <td className="px-4 py-2">
                        <span className={"chip " + chipOS[p.estadoOS]}>{rotuloOS[p.estadoOS]}</span>
                      </td>
                      <td className="dato hidden px-4 py-2 text-xs text-muted md:table-cell">{p.ultimaVisita}</td>
                      <td className="px-4 py-2">
                        <span className={"chip " + chipRecall[nivel]}>
                          {p.diasDesdeVisita} d · {rotuloRecall[nivel]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {!cargando && !visibles.length && <p className="py-10 text-center text-sm text-muted">Sin resultados.</p>}
        </section>
      )}

      <FichaLateral
        abierta={!!sel}
        titulo={sel?.nombre ?? ""}
        subtitulo={sel ? `${sel.id} · ${sel.edad} años` : undefined}
        onCerrar={() => setSel(null)}
        acciones={
          sel && (
            <>
              <button
                type="button"
                className={botonPrimario}
                onClick={() => setAviso(`Demo: no se guardó nada. Se habría enviado un recordatorio a ${sel.nombre}.`)}
              >
                Enviar recordatorio
              </button>
              <button
                type="button"
                className={botonSecundario}
                onClick={() => setAviso(`Demo: no se guardó nada. Se abriría la agenda para dar turno a ${sel.nombre}.`)}
              >
                Agendar turno
              </button>
              <Link href="/ordenes" className={botonSecundario}>
                Abrir ficha clínica
              </Link>
            </>
          )
        }
      >
        {sel && nivelSel && (
          <>
            <div className="flex flex-wrap gap-1.5">
              <span className={"chip " + chipOS[sel.estadoOS]}>obra social {rotuloOS[sel.estadoOS]}</span>
              <span className={"chip " + chipRecall[nivelSel]}>
                recall {rotuloRecall[nivelSel]}
              </span>
              {sel.alertas > 0 && (
                <span className="chip bg-danger/15 text-danger">
                  <AlertTriangle aria-hidden size={12} strokeWidth={1.5} /> {sel.alertas} alerta(s) médica(s)
                </span>
              )}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <DatoFicha etiqueta="Teléfono">
                <span className="dato">{sel.telefono}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Correo">
                <span className="break-all">{sel.email}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Obra social">{sel.obraSocial}</DatoFicha>
              <DatoFicha etiqueta="Autorización">{rotuloOS[sel.estadoOS]}</DatoFicha>
              <DatoFicha etiqueta="Última visita">
                <span className="dato">{sel.ultimaVisita}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Días desde la última visita">
                <span className="dato">{sel.diasDesdeVisita}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Alertas médicas">{sel.alertas ? `${sel.alertas} en la ficha clínica` : "Ninguna"}</DatoFicha>
              <DatoFicha etiqueta="Edad">{sel.edad} años</DatoFicha>
            </dl>
            {nivelSel !== "al dia" && ( // ortografia-ok
              <p className="mt-4 rounded-xl bg-subtle p-3 text-xs leading-snug text-fg">
                Pasaron {sel.diasDesdeVisita} días desde su última visita (a llamar desde los {theme.recall.alerta}). Conviene
                contactar al paciente.
              </p>
            )}
            <AvisoDemo texto={aviso} />
          </>
        )}
      </FichaLateral>
    </div>
  )
}
