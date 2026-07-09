"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { nav } from "./nav-config"
import { theme } from "./theme"

// Tres chasis sobre el mismo nav-config. La palanca `theme.nav` decide.
// ESMALTE corre en `sidebar`: recepcion lo tiene abierto las ocho horas.
// Tratamiento de iconos: lucide-fino (strokeWidth 1.5). Precision clinica,
// sin el chip tintado del vecino #06.

const TRAZO = 1.5

function Marca({ compact = false }: { compact?: boolean }) {
  const iniciales = theme.brand.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
  if (compact) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-heading text-sm font-bold text-surface">
        {iniciales}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-heading text-xs font-bold text-surface">
        {iniciales}
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">{theme.brand.name}</span>
    </span>
  )
}

// --- sidebar: herramienta de escritorio. Targets grandes: se opera con guantes. ---
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface p-[var(--pad)]">
      <div className="mb-8 px-1 pt-1">
        <Marca />
      </div>
      <nav className="space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors " +
                (active
                  ? "bg-primary font-medium text-surface"
                  : "text-muted hover:bg-subtle hover:text-fg")
              }
            >
              <Icon size={19} strokeWidth={TRAZO} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

// --- topbar ---
function Topbar({ path }: { path: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="flex items-center gap-8 px-[var(--pad)] py-3">
        <Marca />
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors " +
                  (active ? "bg-primary text-surface" : "text-muted hover:bg-subtle hover:text-fg")
                }
              >
                <Icon size={17} strokeWidth={TRAZO} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

// --- rail ---
function Rail({ path }: { path: string }) {
  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-4">
      <div className="mb-6">
        <Marca compact />
      </div>
      {nav.map(({ label, href, icon: Icon }) => {
        const active = path === href
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-label={label}
            className={
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors " +
              (active ? "bg-primary text-surface" : "text-muted hover:bg-subtle hover:text-fg")
            }
          >
            <Icon size={20} strokeWidth={TRAZO} />
          </Link>
        )
      })}
    </aside>
  )
}

export function Nav() {
  const path = usePathname()
  if (theme.nav === "topbar") return <Topbar path={path} />
  if (theme.nav === "rail") return <Rail path={path} />
  return <Sidebar path={path} />
}
