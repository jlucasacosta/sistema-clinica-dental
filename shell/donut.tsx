"use client"
// donut · el ULTIMO grafico libre del catalogo. Este sistema lo cierra.
// Encaja honesto: la produccion del mes partida en categorias de tratamiento es
// part-of-whole puro, el caso canonico del donut. No se usa para nada mas.

export type Porcion = { id: string; label: string; valor: number; tono: Tono }
export type Tono = "primary" | "accent" | "success" | "warning" | "info" | "muted"

// Tailwind no ve `stroke-${tono}`: mapa literal.
const trazo: Record<Tono, string> = {
  primary: "stroke-primary",
  accent: "stroke-accent",
  success: "stroke-success",
  warning: "stroke-warning",
  info: "stroke-info",
  muted: "stroke-muted",
}
const punto: Record<Tono, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  muted: "bg-muted",
}

const R = 42
const C = 2 * Math.PI * R

export function Donut({ porciones, unidad = "" }: { porciones: Porcion[]; unidad?: string }) {
  const total = porciones.reduce((s, p) => s + p.valor, 0) || 1
  let acumulado = 0

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative h-40 w-40 shrink-0">
        {/* el total vive en el centro, en HTML: dentro del SVG rotado saldria de costado */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold leading-none">{total}</span>
          <span className="text-[10px] text-muted">{unidad}</span>
        </div>
      <svg viewBox="0 0 110 110" className="h-40 w-40 -rotate-90">
        <circle cx={55} cy={55} r={R} className="stroke-subtle" strokeWidth={13} fill="none" />
        {porciones.map((p) => {
          const largo = (p.valor / total) * C
          const offset = -acumulado
          acumulado += largo
          return (
            <circle
              key={p.id}
              cx={55}
              cy={55}
              r={R}
              className={trazo[p.tono]}
              strokeWidth={13}
              fill="none"
              strokeDasharray={`${largo} ${C - largo}`}
              strokeDashoffset={offset}
            >
              <title>{`${p.label}: ${p.valor} ${unidad}`}</title>
            </circle>
          )
        })}
      </svg>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5">
        {porciones.map((p) => (
          <li key={p.id} className="flex items-center gap-2 text-[11px]">
            <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + punto[p.tono]} />
            <span className="truncate text-muted">{p.label}</span>
            <span className="dato ml-auto font-semibold">{p.valor}</span>
            <span className="dato w-9 text-right text-muted">{Math.round((p.valor / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
