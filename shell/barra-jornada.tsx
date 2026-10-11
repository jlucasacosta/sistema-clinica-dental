// barra-estado-jornada · ARQUETIPO DE KPI NUEVO.
// Una sola barra horizontal, partida en segmentos PROPORCIONALES al conteo de cada
// estado del dia. No es `barra-metas` (que mide progreso contra un objetivo): esto es un ratio
// apilado multi-estado. El conteo vive UNA vez, adentro de su segmento; la leyenda solo nombra el
// estado. El titulo y el total del dia los pone el tablero.
import { ESTADOS_TURNO, segmentoTurno, chipTurno, type EstadoTurno } from "./dental"

export type Jornada = Record<EstadoTurno, number>

export function BarraEstadoJornada({ jornada }: { jornada: Jornada }) {
  const total = ESTADOS_TURNO.reduce((s, e) => s + jornada[e], 0) || 1 // evita dividir por 0; el total visible lo muestra el tablero

  return (
    <div>
      <div className="mt-2 flex h-9 w-full overflow-hidden rounded-xl border border-border">
        {ESTADOS_TURNO.filter((e) => jornada[e] > 0).map((e) => (
          <span
            key={e}
            style={{ width: (jornada[e] / total) * 100 + "%" }}
            className={"flex items-center justify-center " + segmentoTurno[e]}
            title={`${e}: ${jornada[e]}`}
          >
            <span className="dato text-xs font-bold">{jornada[e]}</span>
          </span>
        ))}
      </div>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {ESTADOS_TURNO.map((e) => (
          <li key={e} className={"chip " + chipTurno[e]}>
            {e}
          </li>
        ))}
      </ul>
    </div>
  )
}
