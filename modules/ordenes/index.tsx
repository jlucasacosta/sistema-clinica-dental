"use client"
import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, History, Pencil } from "lucide-react"
import { getFichas, piezasEnVisita, type Ficha } from "./api"
import { Odontograma, PiezaHeroe, type Pieza } from "@/shell/odontograma"
import {
  ESTADOS,
  chipEstado,
  puntoEstado,
  chipOS,
  estadoDePieza,
  esPatologica,
  nombrePieza,
  planAbandonado,
  type Cara,
  type EstadoPieza,
} from "@/shell/dental"

// odontograma-interactivo + odontograma-timelapse (COMPONENTE ESTRELLA).
// El scrubber indexa las visitas del paciente: al arrastrarlo, las 32 piezas repintan
// su estado historico. Se ve una caries volverse obturada y una pieza "a extraer"
// pasar a "ausente". Es el mismo canvas SVG, pero en modo lectura.

// Al hacer click en una cara, su estado cicla por esta rueda. Mapa literal, no `bg-${x}`.
function siguienteEstado(e: EstadoPieza): EstadoPieza {
  const i = ESTADOS.indexOf(e)
  return ESTADOS[(i + 1) % ESTADOS.length]
}

function BarraPlan({ ficha }: { ficha: Ficha }) {
  const progreso = ficha.plan.sesionesHechas / ficha.plan.sesionesTotales
  const abandonado = planAbandonado(ficha.diasSinSesion, progreso)
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] text-muted">{ficha.plan.nombre}</p>
        <p className={"dato text-xs font-semibold " + (abandonado ? "text-danger" : "text-fg")}>
          {ficha.plan.sesionesHechas}/{ficha.plan.sesionesTotales} sesiones
        </p>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-subtle">
        <div
          className={"h-full rounded-full " + (abandonado ? "bg-danger" : "bg-primary")}
          style={{ width: Math.round(progreso * 100) + "%" }}
        />
      </div>
      {abandonado && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-danger">
          <AlertTriangle size={12} strokeWidth={1.5} />
          Plan abandonado: {ficha.diasSinSesion} dias sin sesion
        </p>
      )}
    </div>
  )
}

export function OrdenesPage() {
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [selId, setSelId] = useState<string | null>(null)
  const [visita, setVisita] = useState(0)
  const [modo, setModo] = useState<"editar" | "timelapse">("timelapse")
  const [edicion, setEdicion] = useState<Pieza[] | null>(null)
  const [heroe, setHeroe] = useState<number>(46)
  const [pulso, setPulso] = useState<{ fdi: number; cara: Cara } | null>(null)

  useEffect(() => {
    getFichas().then((fs) => {
      setFichas(fs)
      setSelId(fs[0]?.id ?? null)
    })
  }, [])

  const ficha = fichas.find((f) => f.id === selId)

  // Al cambiar de paciente, el scrubber salta a la ultima visita y se limpia la edicion.
  useEffect(() => {
    if (!ficha) return
    setVisita(ficha.visitas.length - 1)
    setEdicion(null)
    setModo("timelapse")
  }, [selId, ficha])

  const piezasHistoricas = useMemo(
    () => (ficha ? piezasEnVisita(ficha, visita) : []),
    [ficha, visita],
  )
  const piezas = modo === "editar" && edicion ? edicion : piezasHistoricas

  useEffect(() => {
    if (!pulso) return
    const t = setTimeout(() => setPulso(null), 440)
    return () => clearTimeout(t)
  }, [pulso])

  const cambiarCara = (fdi: number, cara: Cara) => {
    const base = edicion ?? piezasHistoricas
    setEdicion(
      base.map((p) =>
        p.fdi === fdi ? { ...p, caras: { ...p.caras, [cara]: siguienteEstado(p.caras[cara]) } } : p,
      ),
    )
    setHeroe(fdi)
    setPulso({ fdi, cara })
  }

  const entrarAEditar = () => {
    setEdicion(piezasHistoricas)
    setModo("editar")
  }

  const afectadas = piezas.filter((p) => esPatologica(estadoDePieza(p.caras))).length
  const piezaHeroe = piezas.find((p) => p.fdi === heroe) ?? piezas[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Fichas clinicas</h1>
          <p className="text-[11px] text-muted">
            Toca una cara para cambiar su estado. Arrastra el historial para ver la boca en el tiempo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[15rem_1fr]">
        {/* padron de fichas */}
        <ul className="surface-card max-h-[38rem] overflow-y-auto p-2">
          {fichas.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => setSelId(f.id)}
                className={
                  "target flex w-full flex-col justify-center rounded-xl px-3 py-2 text-left transition-colors " +
                  (f.id === selId ? "bg-primary/10" : "hover:bg-subtle")
                }
              >
                <span className="truncate text-xs font-semibold">{f.paciente}</span>
                <span className="dato text-[10px] text-muted">
                  {f.id} · {f.edad} años
                </span>
              </button>
            </li>
          ))}
        </ul>

        {ficha && piezaHeroe && (
          // min-w-0: un item de grid trae `min-width:auto` y se niega a encoger por
          // debajo de su contenido. Sin esto el panel del plan se sale del `main`,
          // que lo recorta con overflow-x-hidden y lo esconde sin dejar scrollbar.
          <div className="min-w-0 space-y-4">
            {/* banner de paciente: la estructura de pagina del sistema */}
            <div className="surface-card flex flex-wrap items-center gap-4 p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 font-heading text-xl font-bold text-primary">
                {ficha.paciente[0]}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-lg font-bold leading-tight">{ficha.paciente}</h2>
                <p className="dato text-[11px] text-muted">
                  {ficha.edad} años · {ficha.obraSocial} · ultima visita {ficha.ultimaVisita}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className={"chip " + chipOS[ficha.estadoOS]}>
                    obra social {ficha.estadoOS}
                  </span>
                  {ficha.alertas.map((a) => (
                    <span key={a} className="chip bg-danger/15 text-danger">
                      <AlertTriangle size={10} strokeWidth={1.5} /> {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-56 shrink-0">
                <BarraPlan ficha={ficha} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
              <div className="surface-card min-w-0 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-heading text-sm font-bold">Odontograma</h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setModo("timelapse")}
                      className={
                        "chip transition-colors " +
                        (modo === "timelapse" ? "bg-primary text-surface" : "bg-subtle text-muted hover:text-fg")
                      }
                    >
                      <History size={11} strokeWidth={1.5} /> historial
                    </button>
                    <button
                      onClick={entrarAEditar}
                      className={
                        "chip transition-colors " +
                        (modo === "editar" ? "bg-primary text-surface" : "bg-subtle text-muted hover:text-fg")
                      }
                    >
                      <Pencil size={11} strokeWidth={1.5} /> editar
                    </button>
                  </div>
                </div>

                <Odontograma
                  piezas={piezas}
                  interactivo={modo === "editar"}
                  onCara={cambiarCara}
                  onSeleccionar={setHeroe}
                  seleccionada={heroe}
                  pulso={pulso}
                />

                {/* EL SCRUBBER: el componente estrella. */}
                <div className="mt-5 border-t border-border pt-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Historial clinico
                    </p>
                    <p className="dato text-[11px] text-muted">
                      visita {visita + 1} de {ficha.visitas.length}
                    </p>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={ficha.visitas.length - 1}
                    step={1}
                    value={visita}
                    aria-label="Linea de tiempo de la historia clinica"
                    onChange={(e) => {
                      setVisita(Number(e.target.value))
                      setModo("timelapse")
                      setEdicion(null)
                    }}
                    className="mt-2 w-full accent-primary"
                  />
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <p className="dato text-xs font-semibold text-primary">
                      {ficha.visitas[visita].fecha}
                    </p>
                    <p className="text-[11px] text-muted">{ficha.visitas[visita].profesional}</p>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted">{ficha.visitas[visita].nota}</p>
                </div>
              </div>

              {/* la PIEZA HEROE + el contador que sube */}
              <div className="surface-card flex flex-col gap-4 p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Piezas con patologia</p>
                  <p key={afectadas} className="contador-sube font-heading text-4xl font-bold leading-none text-danger">
                    {afectadas}
                  </p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-[11px] font-semibold">{nombrePieza(piezaHeroe.fdi)}</p>
                  <p className="mb-2 text-[10px] text-muted">
                    {modo === "editar" ? "toca una cara para cambiarla" : "modo lectura"}
                  </p>
                  <PiezaHeroe
                    pieza={piezaHeroe}
                    interactivo={modo === "editar"}
                    onCara={cambiarCara}
                    pulso={pulso?.fdi === piezaHeroe.fdi ? pulso.cara : null}
                  />
                </div>

                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-[10px] uppercase tracking-wide text-muted">Referencias</p>
                  <ul className="space-y-1">
                    {ESTADOS.map((e) => (
                      <li key={e} className="flex items-center gap-2 text-[11px]">
                        <span className={"h-2.5 w-2.5 rounded-full " + puntoEstado[e]} />
                        <span className="text-muted">{e}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[10px] leading-snug text-muted">
                    &quot;a extraer&quot; se distingue de &quot;caries&quot; por la cruz, no por el color.
                  </p>
                </div>
              </div>
            </div>

            {/* el estado de cada pieza patologica, en chips semanticos */}
            <div className="surface-card p-4">
              <h3 className="mb-2 font-heading text-sm font-bold">Piezas comprometidas</h3>
              <div className="flex flex-wrap gap-1.5">
                {piezas
                  .filter((p) => estadoDePieza(p.caras) !== "sana")
                  .map((p) => {
                    const e = estadoDePieza(p.caras)
                    return (
                      <button
                        key={p.fdi}
                        onClick={() => setHeroe(p.fdi)}
                        className={"chip transition-transform hover:scale-105 " + chipEstado[e]}
                      >
                        <span className="fdi">{p.fdi}</span> {e}
                      </button>
                    )
                  })}
                {piezas.every((p) => estadoDePieza(p.caras) === "sana") && (
                  <p className="text-[11px] text-muted">Boca sana en esta visita.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
