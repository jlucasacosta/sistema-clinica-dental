import { LayoutDashboard, CalendarClock, Stethoscope, MessageSquare, Users, Settings, type LucideIcon } from "lucide-react"

export type NavItem = { label: string; href: string; icon: LucideIcon }

// "Fichas" es /ordenes: en una clinica la orden de trabajo ES la ficha clinica.
// La agenda va segunda: manda funcionalmente, pero la estrella vive en la ficha.
export const nav: NavItem[] = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/agenda", icon: CalendarClock },
  { label: "Fichas", href: "/ordenes", icon: Stethoscope },
  { label: "Mensajes", href: "/conversaciones", icon: MessageSquare },
  { label: "Pacientes", href: "/contactos", icon: Users },
  { label: "Configuracion", href: "/config", icon: Settings },
]
