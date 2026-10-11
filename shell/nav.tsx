"use client"
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { nav } from "./nav-config"
import { theme } from "./theme"

// Tres chasis sobre el mismo nav-config. La palanca `theme.nav` decide.
// ESMALTE corre en `sidebar`: recepcion lo tiene abierto las ocho horas.
// Tratamiento de iconos: lucide-fino (strokeWidth 1.5). Precision clinica,
// sin el chip tintado del vecino #06.
//
// Celular: bajo `md` la navegacion es una tira horizontal. Como es mas ancha que la pantalla,
// avisa de que lado queda contenido (degrade con mascara en ese borde) y centra la seccion
// activa al cargar y al cambiar de ruta. El pie del menu lleva la cuenta demo.

const TRAZO = 1.5

const esActivo = (path: string | null, href: string) => path === href || (!!path && path.startsWith(href + "/"))

function Marca({ compact = false }: { compact?: boolean }) {
  const iniciales = theme.brand.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
  // Las iniciales son decoracion: el nombre de la marca ya esta en texto al lado
  // (en el rail compacto, `aria-label` en el link del logo no existe: el nombre va sr-only).
  if (compact) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-heading text-sm font-bold text-surface">
        <span aria-hidden>{iniciales}</span>
        <span className="sr-only">{theme.brand.name}</span>
      </span>
    )
  }
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-heading text-xs font-bold text-surface">
        {iniciales}
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">{theme.brand.name}</span>
    </span>
  )
}

// Pie del menu: usuario de la demo. No hay login real; las iniciales son fijas ("CD" = Cuenta Demo).
function Cuenta({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span
        role="img"
        aria-label={`Cuenta demo de ${theme.brand.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
      >
        CD
      </span>
    )
  }
  return (
    <div className="flex items-center gap-3 border-t border-border px-3 pt-4">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
      >
        CD
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{theme.brand.name} Odontología</p>
        <p className="text-xs text-muted">Cuenta demo</p>
      </div>
    </div>
  )
}

// Tira horizontal de navegacion (celular y topbar). Devuelve la ref, el handler de scroll y el
// estilo de mascara: solo hay degrade en el borde donde queda contenido por scrollear.
function useTira(path: string | null) {
  const tira = useRef<HTMLElement>(null)
  const [fade, setFade] = useState({ izq: false, der: false })

  const medir = useCallback(() => {
    const el = tira.current
    if (!el) return
    const izq = el.scrollLeft > 4
    const der = el.scrollWidth - el.clientWidth - el.scrollLeft > 4
    setFade((f) => (f.izq === izq && f.der === der ? f : { izq, der }))
  }, [])

  // Centra la seccion activa (solo si la tira desborda) y mide el degrade.
  useEffect(() => {
    const el = tira.current
    if (!el) return
    if (el.scrollWidth > el.clientWidth) {
      el.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" })
    }
    medir()
  }, [path, medir])

  useEffect(() => {
    window.addEventListener("resize", medir)
    return () => window.removeEventListener("resize", medir)
  }, [medir])

  // Transparencia pura, sin colores: el borde con contenido se desvanece.
  const borde = "2.5rem"
  const paradas = [
    fade.izq ? "transparent 0px" : "black 0px",
    `black ${fade.izq ? borde : "0px"}`,
    `black calc(100% - ${fade.der ? borde : "0px"})`,
    fade.der ? "transparent 100%" : "black 100%",
  ]
  const mascara = fade.izq || fade.der ? `linear-gradient(to right, ${paradas.join(", ")})` : undefined
  const estilo: CSSProperties = { WebkitMaskImage: mascara, maskImage: mascara }
  return { tira, medir, estilo }
}

// --- sidebar: herramienta de escritorio. Targets grandes: se opera con guantes. ---
function Sidebar({ path }: { path: string | null }) {
  const { tira, medir, estilo } = useTira(path)
  return (
    <>
      {/* desde md: sidebar de escritorio. sticky + h-dvh: queda fija mientras el contenido scrollea. */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface p-[var(--pad)] md:flex">
        <div className="mb-8 px-1 pt-1">
          <Marca />
        </div>
        <nav aria-label="Principal" className="space-y-1">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = esActivo(path, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "target flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors " +
                  (active
                    ? "bg-primary font-medium text-surface"
                    : "text-muted hover:bg-subtle hover:text-fg")
                }
              >
                <Icon size={19} strokeWidth={TRAZO} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-6">
          <Cuenta />
        </div>
      </aside>

      {/* bajo md: la misma navegacion como cabecera con scroll horizontal. Sin esto la
          sidebar de 15rem se comia 240px de un viewport de 390px. */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface md:hidden">
        <div className="flex items-center justify-between px-[var(--pad)] pt-3">
          <Marca />
          <Cuenta compact />
        </div>
        <nav
          ref={tira}
          onScroll={medir}
          style={estilo}
          aria-label="Principal"
          className="flex gap-1 overflow-x-auto px-[var(--pad)] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const active = esActivo(path, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "target flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors " +
                  (active ? "bg-primary font-medium text-surface" : "text-muted hover:bg-subtle hover:text-fg")
                }
              >
                <Icon size={17} strokeWidth={TRAZO} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>
      </header>
    </>
  )
}

// --- topbar ---
function Topbar({ path }: { path: string | null }) {
  const { tira, medir, estilo } = useTira(path)
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="flex items-center gap-8 px-[var(--pad)] py-3">
        <Marca />
        <nav
          ref={tira}
          onScroll={medir}
          style={estilo}
          aria-label="Principal"
          className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const active = esActivo(path, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "target flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors " +
                  (active ? "bg-primary text-surface" : "text-muted hover:bg-subtle hover:text-fg")
                }
              >
                <Icon size={17} strokeWidth={TRAZO} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>
        <Cuenta compact />
      </div>
    </header>
  )
}

// --- rail ---
function Rail({ path }: { path: string | null }) {
  return (
    <aside className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-border bg-surface py-4">
      <div className="mb-6">
        <Marca compact />
      </div>
      <nav aria-label="Principal" className="flex flex-col items-center gap-2">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = esActivo(path, href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={
                "flex h-11 w-11 items-center justify-center rounded-xl transition-colors " +
                (active ? "bg-primary text-surface" : "text-muted hover:bg-subtle hover:text-fg")
              }
            >
              <Icon size={20} strokeWidth={TRAZO} aria-hidden />
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto pt-4">
        <Cuenta compact />
      </div>
    </aside>
  )
}

export function Nav() {
  const path = usePathname()
  if (theme.nav === "topbar") return <Topbar path={path} />
  if (theme.nav === "rail") return <Rail path={path} />
  return <Sidebar path={path} />
}
