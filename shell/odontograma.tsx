"use client"
// odontograma-interactivo · ARQUETIPO DE DATOS NUEVO.
// No es una grilla de 32 celdas: es un DIAGRAMA ESPACIAL. Cada pieza es un SVG con
// cinco caras (paths) clickeables por separado, y su orientacion depende de donde
// vive la pieza en la boca:
//   - vestibular apunta SIEMPRE hacia afuera del arco (arriba en la arcada superior,
//     abajo en la inferior).
//   - mesial apunta SIEMPRE hacia la linea media (a la derecha en los cuadrantes 1 y 4,
//     a la izquierda en el 2 y el 3).
// Eso es lo que una tabla no puede tener, y por eso el arquetipo es nuevo.
//
// ACCESIBILIDAD (auditoria F-01 / F-05):
//   - Las 32 piezas son un radiogroup con UN solo tab-stop (roving tabindex): las flechas
//     mueven entre piezas y entre arcadas, y elegir una pieza la abre en el panel grande.
//   - Las caras SVG siguen siendo clickeables con el mouse; la via de teclado para editarlas
//     son los botones de 44px de `PiezaHeroe`. Los SVG van `aria-hidden`: el lector
//     recibe el estado por el nombre de cada pieza, no por 160 <title>.
//   - El color no es el unico canal: cada estado lleva una marca de forma (ver MARCAS).
import { useRef, type KeyboardEvent } from "react"
import {
  CARAS,
  CUADRANTES,
  piezasDe,
  estadoDePieza,
  caraFill,
  caraStroke,
  nombrePieza,
  rotuloCaraCentral,
  type Cara,
  type Cuadrante,
  type EstadoPieza,
} from "./dental"

export type Pieza = { fdi: number; caras: Record<Cara, EstadoPieza> }

const V = 40 // viewBox de la pieza
const I = 12 // borde interno: donde arranca la cara central

// Los cinco paths, en coordenadas de pantalla. `arriba`/`abajo`/`izq`/`der` son
// posiciones; que cara ocupa cada posicion lo decide el cuadrante.
const PATHS = {
  centro: `M ${I} ${I} H ${V - I} V ${V - I} H ${I} Z`,
  arriba: `M 0 0 H ${V} L ${V - I} ${I} H ${I} Z`,
  abajo: `M 0 ${V} H ${V} L ${V - I} ${V - I} H ${I} Z`,
  izq: `M 0 0 V ${V} L ${I} ${V - I} V ${I} Z`,
  der: `M ${V} 0 V ${V} L ${V - I} ${V - I} V ${I} Z`,
}

// Centro visual de cada path: ahi va la marca de forma del estado.
const CENTROS: Record<keyof typeof PATHS, [number, number]> = {
  centro: [V / 2, V / 2],
  arriba: [V / 2, 5.5],
  abajo: [V / 2, V - 5.5],
  izq: [5.5, V / 2],
  der: [V - 5.5, V / 2],
}

// MARCAS DE FORMA por estado: el color solo no alcanza (caries rojo y endodoncia coral
// colapsan con daltonismo). Caries queda "llena y lisa"; el resto suma una marca blanca.
//   obturada = punto · corona = anillo · endodoncia = barra (el conducto)
// `a extraer` y `ausente` ya se distinguen por su cruz, dibujada a nivel pieza.
function Marca({ estado, x, y, escala = 1 }: { estado: EstadoPieza; x: number; y: number; escala?: number }) {
  if (estado === "obturada") return <circle cx={x} cy={y} r={2.2 * escala} className="fill-surface" />
  if (estado === "corona")
    return <circle cx={x} cy={y} r={2.8 * escala} className="fill-none stroke-surface" strokeWidth={1.3 * escala} />
  if (estado === "endodoncia")
    return (
      <line
        x1={x}
        y1={y - 3 * escala}
        x2={x}
        y2={y + 3 * escala}
        className="stroke-surface"
        strokeWidth={1.8 * escala}
        strokeLinecap="round"
      />
    )
  return null
}

// Muestra de un estado para las leyendas: el mismo relleno, borde y marca que la cara real.
export function MuestraEstado({ estado, tamano = 16 }: { estado: EstadoPieza; tamano?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={tamano} height={tamano} aria-hidden focusable={false} className="shrink-0">
      <rect x={1} y={1} width={14} height={14} rx={3} className={caraFill[estado] + " " + caraStroke[estado]} strokeWidth={1} />
      <Marca estado={estado} x={8} y={8} escala={0.9} />
      {estado === "ausente" && (
        <g className="stroke-muted" strokeWidth={1.2} strokeLinecap="round">
          <line x1={4} y1={4} x2={12} y2={12} />
          <line x1={12} y1={4} x2={4} y2={12} />
        </g>
      )}
      {estado === "a extraer" && (
        <g className="stroke-danger" strokeWidth={2} strokeLinecap="round">
          <line x1={3.5} y1={3.5} x2={12.5} y2={12.5} />
          <line x1={12.5} y1={3.5} x2={3.5} y2={12.5} />
        </g>
      )}
    </svg>
  )
}

// Cuadrante -> que cara va en cada posicion del dibujo.
function mapaDeCaras(cuadrante: Cuadrante): Record<keyof typeof PATHS, Cara> {
  const superior = cuadrante === 1 || cuadrante === 2
  const mesialALaDerecha = cuadrante === 1 || cuadrante === 4
  return {
    centro: "oclusal",
    arriba: superior ? "vestibular" : "lingual",
    abajo: superior ? "lingual" : "vestibular",
    der: mesialALaDerecha ? "mesial" : "distal",
    izq: mesialALaDerecha ? "distal" : "mesial",
  }
}

function cuadranteDe(fdi: number): Cuadrante {
  return Math.floor(fdi / 10) as Cuadrante
}

// Lo que el lector de pantalla dice de una pieza: "sana", el estado de toda la pieza, o
// la lista de caras con patologia / tratamiento.
export function resumenPieza(pieza: Pieza): string {
  const estado = estadoDePieza(pieza.caras)
  if (estado === "sana") return "sana"
  if (estado === "ausente") return "ausente"
  const vals = CARAS.map((c) => pieza.caras[c])
  if (vals.every((v) => v === vals[0])) return vals[0]
  return CARAS.filter((c) => pieza.caras[c] !== "sana")
    .map((c) => `${c === "oclusal" ? rotuloCaraCentral(pieza.fdi) : c}: ${pieza.caras[c]}`)
    .join(", ")
}

export function DienteSVG({
  pieza,
  onCara,
  caraPulsada,
  interactivo = true,
  tamano = 40,
}: {
  pieza: Pieza
  onCara?: (fdi: number, cara: Cara) => void
  caraPulsada?: Cara | null
  interactivo?: boolean
  tamano?: number
}) {
  const cuadrante = cuadranteDe(pieza.fdi)
  const mapa = mapaDeCaras(cuadrante)
  const estado = estadoDePieza(pieza.caras)
  const ausente = estado === "ausente"
  const aExtraer = estado === "a extraer"

  return (
    <svg
      viewBox={`0 0 ${V} ${V}`}
      width={tamano}
      height={tamano}
      className="overflow-visible"
      aria-hidden
      focusable={false}
    >
      {(Object.keys(PATHS) as (keyof typeof PATHS)[]).map((pos) => {
        const cara = mapa[pos]
        const e = pieza.caras[cara]
        const rotulo = cara === "oclusal" ? rotuloCaraCentral(pieza.fdi) : cara
        const [cx, cy] = CENTROS[pos]
        return (
          <g key={pos}>
            <path
              d={PATHS[pos]}
              className={
                "pieza-cara " +
                caraFill[e] +
                " " +
                caraStroke[e] +
                (interactivo ? " cursor-pointer hover:opacity-80" : "") +
                (caraPulsada === cara ? " cara-cambiada" : "")
              }
              strokeWidth={1}
              onClick={interactivo && onCara ? () => onCara(pieza.fdi, cara) : undefined}
            >
              <title>{`Pieza ${pieza.fdi} · ${rotulo}: ${e}`}</title>
            </path>
            <g className="pointer-events-none">
              <Marca estado={e} x={cx} y={cy} />
            </g>
          </g>
        )
      })}

      {/* ausente: cruz fina en muted. La pieza no esta, pero el lugar si. */}
      {ausente && (
        <g className="stroke-muted" strokeWidth={1.5} strokeLinecap="round">
          <line x1={4} y1={4} x2={V - 4} y2={V - 4} />
          <line x1={V - 4} y1={4} x2={4} y2={V - 4} />
        </g>
      )}

      {/* a extraer: cruz GRUESA en danger. Se desambigua de `caries` por FORMA, no por color. */}
      {aExtraer && (
        <g className="stroke-danger" strokeWidth={3.5} strokeLinecap="round">
          <line x1={3} y1={3} x2={V - 3} y2={V - 3} />
          <line x1={V - 3} y1={3} x2={3} y2={V - 3} />
        </g>
      )}
    </svg>
  )
}

function PiezaEnArcada({
  pieza,
  onCara,
  onSeleccionar,
  seleccionada,
  tabStop,
  caraPulsada,
  interactivo,
  indice,
}: {
  pieza: Pieza
  onCara?: (fdi: number, cara: Cara) => void
  onSeleccionar?: (fdi: number) => void
  seleccionada: boolean
  tabStop: boolean
  caraPulsada?: Cara | null
  interactivo: boolean
  indice: number
}) {
  return (
    <div
      className="brotando flex flex-col items-center gap-1"
      style={{ animationDelay: `${indice * 12}ms` }}
    >
      {/* La pieza es UN radio del grupo: nombre = pieza + estado, foco = seleccion. */}
      <div
        role="radio"
        aria-checked={seleccionada}
        aria-label={`Pieza ${pieza.fdi}, ${nombrePieza(pieza.fdi).toLowerCase()}: ${resumenPieza(pieza)}`}
        data-fdi={pieza.fdi}
        tabIndex={tabStop ? 0 : -1}
        onMouseEnter={() => onSeleccionar?.(pieza.fdi)}
        onFocus={() => onSeleccionar?.(pieza.fdi)}
        onClick={() => onSeleccionar?.(pieza.fdi)}
        className={"rounded-md p-0.5 transition-colors " + (seleccionada ? "bg-primary/15" : "")}
      >
        <DienteSVG pieza={pieza} onCara={onCara} caraPulsada={caraPulsada} interactivo={interactivo} />
      </div>
      <span
        aria-hidden
        className={"fdi text-[0.6875rem] " + (seleccionada ? "font-bold text-primary" : "text-muted")}
      >
        {pieza.fdi}
      </span>
    </div>
  )
}

function Arcada({
  piezas,
  cuadrantes,
  foco,
  ...rest
}: {
  piezas: Pieza[]
  cuadrantes: [Cuadrante, Cuadrante]
  foco: number
  onCara?: (fdi: number, cara: Cara) => void
  onSeleccionar?: (fdi: number) => void
  seleccionada: number | null
  pulso: { fdi: number; cara: Cara } | null
  interactivo: boolean
}) {
  const de = (c: Cuadrante) =>
    piezasDe(c)
      .map((fdi) => piezas.find((p) => p.fdi === fdi))
      .filter((p): p is Pieza => !!p)

  return (
    <div className="flex items-start justify-center gap-3">
      {cuadrantes.map((c, ci) => (
        <div key={c} className="flex items-start gap-1">
          {de(c).map((p, i) => (
            <PiezaEnArcada
              key={p.fdi}
              pieza={p}
              indice={ci * 8 + i}
              seleccionada={rest.seleccionada === p.fdi}
              tabStop={foco === p.fdi}
              caraPulsada={rest.pulso?.fdi === p.fdi ? rest.pulso.cara : null}
              interactivo={rest.interactivo}
              onCara={rest.onCara}
              onSeleccionar={rest.onSeleccionar}
            />
          ))}
          {/* la linea media, entre los dos cuadrantes de la arcada */}
          {ci === 0 && <span aria-hidden className="mx-1 h-12 w-px shrink-0 bg-border" />}
        </div>
      ))}
    </div>
  )
}

// Orden visual de cada arcada, de izquierda a derecha.
const FILA_SUP = [...piezasDe(1), ...piezasDe(2)]
const FILA_INF = [...piezasDe(4), ...piezasDe(3)]

export function Odontograma({
  piezas,
  onCara,
  onSeleccionar,
  seleccionada = null,
  pulso = null,
  interactivo = true,
}: {
  piezas: Pieza[]
  onCara?: (fdi: number, cara: Cara) => void
  onSeleccionar?: (fdi: number) => void
  seleccionada?: number | null
  pulso?: { fdi: number; cara: Cara } | null
  interactivo?: boolean
}) {
  const grupo = useRef<HTMLDivElement>(null)
  const comun = { onCara, onSeleccionar, seleccionada, pulso, interactivo }
  // Roving tabindex: un solo tab-stop, en la pieza seleccionada (o la primera).
  const foco = seleccionada ?? FILA_SUP[0]

  // Flechas: izquierda/derecha dentro de la arcada, arriba/abajo cambia de arcada
  // (mismo indice: 18 <-> 48, 11 <-> 41). Home/End = extremos de la arcada.
  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-fdi]")
    if (!el) return
    const fdi = Number(el.dataset.fdi)
    const arriba = FILA_SUP.includes(fdi)
    const fila = arriba ? FILA_SUP : FILA_INF
    const i = fila.indexOf(fdi)
    let siguiente: number | undefined
    if (e.key === "ArrowRight") siguiente = fila[Math.min(i + 1, fila.length - 1)]
    else if (e.key === "ArrowLeft") siguiente = fila[Math.max(i - 1, 0)]
    else if (e.key === "ArrowDown" && arriba) siguiente = FILA_INF[i]
    else if (e.key === "ArrowUp" && !arriba) siguiente = FILA_SUP[i]
    else if (e.key === "Home") siguiente = fila[0]
    else if (e.key === "End") siguiente = fila[fila.length - 1]
    else return
    e.preventDefault()
    if (siguiente === undefined) return
    onSeleccionar?.(siguiente)
    grupo.current?.querySelector<HTMLElement>(`[data-fdi="${siguiente}"]`)?.focus()
  }

  return (
    <div className="space-y-4 overflow-x-auto">
      <p id="odontograma-ayuda" className="sr-only">
        Usá las flechas para moverte entre las piezas. La pieza elegida se abre en el panel de la derecha, donde se
        cambia el estado de cada cara.
      </p>
      <div
        ref={grupo}
        role="radiogroup"
        aria-label="Piezas dentales, sistema FDI"
        aria-describedby="odontograma-ayuda"
        onKeyDown={alTeclear}
        className="min-w-[42rem] space-y-4"
      >
        {/* arcada superior: cuadrante 1 (derecha del paciente) y 2 */}
        <Arcada piezas={piezas} cuadrantes={[1, 2]} foco={foco} {...comun} />
        <div aria-hidden className="mx-auto h-px w-full max-w-2xl bg-border" />
        {/* arcada inferior: cuadrante 4 y 3 */}
        <Arcada piezas={piezas} cuadrantes={[4, 3]} foco={foco} {...comun} />
      </div>
    </div>
  )
}

// La PIEZA HEROE: el diente gigante del frame-firma. En 9:16 a 2x, las 32 piezas
// chiquitas son ruido; esta se lee sola. En modo edicion es tambien la via de teclado:
// cada cara es un boton de 44px.
export function PiezaHeroe({
  pieza,
  onCara,
  pulso,
  interactivo = true,
}: {
  pieza: Pieza
  onCara?: (fdi: number, cara: Cara) => void
  pulso?: Cara | null
  interactivo?: boolean
}) {
  const cuadrante = cuadranteDe(pieza.fdi)
  const mapa = mapaDeCaras(cuadrante)
  const posiciones = (Object.keys(PATHS) as (keyof typeof PATHS)[]).filter((p) => p !== "centro")
  const editable = interactivo && !!onCara

  return (
    <div className="flex flex-col items-center gap-3">
      <DienteSVG pieza={pieza} onCara={onCara} caraPulsada={pulso ?? null} interactivo={interactivo} tamano={190} />
      <div className="text-center">
        <p className="fdi text-3xl font-bold leading-none">{pieza.fdi}</p>
        <p className="mt-1 text-[0.6875rem] text-muted">
          {rotuloCaraCentral(pieza.fdi) === "incisal" ? "cara incisal" : "cara oclusal"} en el centro
        </p>
      </div>
      <ul className="grid w-full grid-cols-1 gap-1" aria-label={`Caras de la pieza ${pieza.fdi}`}>
        {[mapa.centro, ...posiciones.map((p) => mapa[p])]
          .filter((c, i, arr) => arr.indexOf(c) === i)
          .map((cara) => {
            const rotulo = cara === "oclusal" ? rotuloCaraCentral(pieza.fdi) : cara
            const estado = pieza.caras[cara]
            const contenido = (
              <>
                <span className="text-muted">{rotulo}</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MuestraEstado estado={estado} />
                  {estado}
                </span>
              </>
            )
            return (
              <li key={cara}>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => onCara?.(pieza.fdi, cara)}
                    aria-label={`Cara ${rotulo} de la pieza ${pieza.fdi}: ${estado}. Cambiar al estado siguiente`}
                    className="target flex w-full items-center justify-between rounded-xl border border-border px-2.5 text-[0.6875rem] transition-colors hover:bg-subtle"
                  >
                    {contenido}
                  </button>
                ) : (
                  <p className="flex items-center justify-between text-[0.6875rem]">{contenido}</p>
                )}
              </li>
            )
          })}
      </ul>
    </div>
  )
}

export { CARAS, CUADRANTES }
