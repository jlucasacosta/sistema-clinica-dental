"use client"
import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import { theme } from "@/shell/theme"
import { ESTADOS } from "@/shell/dental"
import { MuestraEstado } from "@/shell/odontograma"

// ACORDEON: secciones colapsables. Config no es heroe: el reuso de arquetipo aca es
// invisible y el abogado del diablo lo aprobo. Todo sale de shell/theme.ts.

function Fila({ label, value, swatch }: { label: string; value: string; swatch?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-[0.6875rem] text-muted">{label}</span>
      <span className="dato flex items-center gap-2 text-[0.6875rem] font-medium">
        {swatch && <span aria-hidden className="h-4 w-4 rounded border border-border" style={{ background: value }} />}
        {value}
      </span>
    </div>
  )
}

function Seccion({ titulo, children, abierta, nota }: { titulo: string; children: React.ReactNode; abierta?: boolean; nota?: string }) {
  const [open, setOpen] = useState(!!abierta)
  const panel = useId()
  return (
    <section className="surface-card overflow-hidden">
      {/* h2 > button: el encabezado sigue siendo encabezado y el boton expone abierto/cerrado */}
      <h2 className="font-heading text-xs font-bold uppercase tracking-wide">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panel}
          className="target flex w-full items-center justify-between px-4 py-3 text-left uppercase tracking-wide transition-colors hover:bg-subtle"
        >
          {titulo}
          <ChevronDown aria-hidden size={16} strokeWidth={1.5} className={"text-muted transition-transform " + (open ? "rotate-180" : "")} />
        </button>
      </h2>
      {open && (
        <div id={panel} className="border-t border-border px-4 py-3">
          {nota && <p className="mb-2 text-[0.6875rem] leading-snug text-muted">{nota}</p>}
          {children}
        </div>
      )}
    </section>
  )
}

export function ConfigPage() {
  const c = theme.colors
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Configuración</h1>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <Seccion titulo="Clínica" abierta>
            <Fila label="Marca" value={theme.brand.name} />
            <Fila label="Sillones" value="4" />
            <Fila label="Profesionales" value="3" />
            <Fila label="Horario" value="08:00 a 19:00" />
          </Seccion>

          <Seccion
            titulo="Dominio: ciclo del sillón"
            nota="El bloque de la agenda dibuja estas dos bandas alrededor de la atención. Subí la esterilización y toda la grilla se aprieta."
          >
            <Fila label="Montaje" value={`${theme.ciclo.montaje} min`} />
            <Fila label="Esterilización" value={`${theme.ciclo.esterilizacion} min`} />
            <Fila label="Meta de ocupación" value={`${Math.round(theme.ocupacion.meta * 100)}%`} />
            <Fila label="Alarma de ausentismo" value={`${Math.round(theme.noShow.alerta * 100)}%`} />
          </Seccion>

          <Seccion titulo="Dominio: recall y planes">
            <Fila label="Paciente a llamar desde" value={`${theme.recall.alerta} días`} />
            <Fila label="Paciente perdido desde" value={`${theme.recall.vencido} días`} />
            <Fila label="Plan abandonado desde" value={`${theme.plan.abandonado} días sin sesión`} />
          </Seccion>
        </div>

        <div className="space-y-3">
          <Seccion titulo="Forma" abierta>
            <Fila label="Modo" value={theme.mode} />
            <Fila label="Navegación" value={theme.nav} />
            <Fila label="Elevación" value={theme.elevation} />
            <Fila label="Bordes" value={theme.radius} />
            <Fila label="Densidad" value={theme.density} />
            <Fila label="Chips" value={theme.badge} />
            <Fila label="Títulos" value={theme.font.heading} />
            <Fila label="Cuerpo" value={theme.font.body} />
          </Seccion>

          <Seccion
            titulo="Paleta"
            nota="El teal es el color de la marca y NUNCA se usa como estado de pieza: se confundiría con el verde de 'sana'."
          >
            <Fila label="Teal menta (primario)" value={c.primary} swatch />
            <Fila label="Coral (acento, endodoncia)" value={c.accent} swatch />
            <Fila label="Atendido / al día" value={c.success} swatch />
            <Fila label="Corona / a llamar" value={c.warning} swatch />
            <Fila label="Caries / ausente al turno" value={c.danger} swatch />
            <Fila label="Obturada / confirmado" value={c.info} swatch />
          </Seccion>

          <Seccion titulo="Estados de la pieza" nota="Siete estados contra cuatro semánticos: 'a extraer' se distingue de 'caries' por la cruz, no por el color.">
            <ul className="grid grid-cols-2 gap-1.5 pt-1">
              {ESTADOS.map((e) => (
                <li key={e} className="flex items-center gap-2 text-[0.6875rem]">
                  <MuestraEstado estado={e} />
                  <span className="text-muted">{e}</span>
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion titulo="Integraciones">
            <Fila label="Obras sociales" value="mock (sin backend)" />
            <Fila label="WhatsApp" value="mock (sin backend)" />
            <Fila label="Facturación" value="mock (sin backend)" />
            <p className="pt-2 text-[0.6875rem] leading-snug text-muted">
              Demo frontend con datos de ejemplo. Sin backend conectado. Todo el diseño sale de shell/theme.ts.
            </p>
          </Seccion>
        </div>
      </div>
    </div>
  )
}
