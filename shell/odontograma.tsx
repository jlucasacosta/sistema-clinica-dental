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
import {
  CARAS,
  CUADRANTES,
  piezasDe,
  estadoDePieza,
  caraFill,
  caraStroke,
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
    <svg viewBox={`0 0 ${V} ${V}`} width={tamano} height={tamano} className="overflow-visible">
      {(Object.keys(PATHS) as (keyof typeof PATHS)[]).map((pos) => {
        const cara = mapa[pos]
        const e = pieza.caras[cara]
        const rotulo = cara === "oclusal" ? rotuloCaraCentral(pieza.fdi) : cara
        return (
          <path
            key={pos}
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

function Pieza({
  pieza,
  onCara,
  onSeleccionar,
  seleccionada,
  caraPulsada,
  interactivo,
  indice,
}: {
  pieza: Pieza
  onCara?: (fdi: number, cara: Cara) => void
  onSeleccionar?: (fdi: number) => void
  seleccionada: boolean
  caraPulsada?: Cara | null
  interactivo: boolean
  indice: number
}) {
  return (
    <div
      className="brotando flex flex-col items-center gap-1"
      style={{ animationDelay: `${indice * 12}ms` }}
    >
      <div
        onMouseEnter={() => onSeleccionar?.(pieza.fdi)}
        className={"rounded-md p-0.5 transition-colors " + (seleccionada ? "bg-primary/15" : "")}
      >
        <DienteSVG pieza={pieza} onCara={onCara} caraPulsada={caraPulsada} interactivo={interactivo} />
      </div>
      <span className={"fdi text-[10px] " + (seleccionada ? "font-bold text-primary" : "text-muted")}>
        {pieza.fdi}
      </span>
    </div>
  )
}

function Arcada({
  piezas,
  cuadrantes,
  ...rest
}: {
  piezas: Pieza[]
  cuadrantes: [Cuadrante, Cuadrante]
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
            <Pieza
              key={p.fdi}
              pieza={p}
              indice={ci * 8 + i}
              seleccionada={rest.seleccionada === p.fdi}
              caraPulsada={rest.pulso?.fdi === p.fdi ? rest.pulso.cara : null}
              interactivo={rest.interactivo}
              onCara={rest.onCara}
              onSeleccionar={rest.onSeleccionar}
            />
          ))}
          {/* la linea media, entre los dos cuadrantes de la arcada */}
          {ci === 0 && <span className="mx-1 h-12 w-px shrink-0 bg-border" />}
        </div>
      ))}
    </div>
  )
}

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
  const comun = { onCara, onSeleccionar, seleccionada, pulso, interactivo }
  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="min-w-[42rem] space-y-4">
        {/* arcada superior: cuadrante 1 (derecha del paciente) y 2 */}
        <Arcada piezas={piezas} cuadrantes={[1, 2]} {...comun} />
        <div className="mx-auto h-px w-full max-w-2xl bg-border" />
        {/* arcada inferior: cuadrante 4 y 3 */}
        <Arcada piezas={piezas} cuadrantes={[4, 3]} {...comun} />
      </div>
    </div>
  )
}

// La PIEZA HEROE: el diente gigante del frame-firma. En 9:16 a 2x, las 32 piezas
// chiquitas son ruido; esta se lee sola.
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

  return (
    <div className="flex flex-col items-center gap-3">
      <DienteSVG pieza={pieza} onCara={onCara} caraPulsada={pulso ?? null} interactivo={interactivo} tamano={190} />
      <div className="text-center">
        <p className="fdi text-3xl font-bold leading-none">{pieza.fdi}</p>
        <p className="mt-1 text-[11px] text-muted">
          {rotuloCaraCentral(pieza.fdi) === "incisal" ? "cara incisal" : "cara oclusal"} en el centro
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-1">
        {[mapa.centro, ...posiciones.map((p) => mapa[p])]
          .filter((c, i, arr) => arr.indexOf(c) === i)
          .map((cara) => (
            <p key={cara} className="flex items-center justify-between text-[11px]">
              <span className="text-muted">
                {cara === "oclusal" ? rotuloCaraCentral(pieza.fdi) : cara}
              </span>
              <span className="font-medium">{pieza.caras[cara]}</span>
            </p>
          ))}
      </div>
    </div>
  )
}

export { CARAS, CUADRANTES }
