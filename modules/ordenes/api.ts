// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dato sigue al arquetipo: un odontograma devuelve PIEZAS y CARAS, no filas.
// La historia clinica es ACUMULATIVA: cada visita agrega lesiones, y el estado del
// odontograma en una fecha es la suma de todas las visitas hasta esa fecha.
// Asi el timelapse no guarda 5 copias de 32 piezas: las reconstruye.
// Personas y obras sociales 100% ficticias.
import { CARAS, type Cara, type EstadoPieza } from "@/shell/dental"
import type { Pieza } from "@/shell/odontograma"
import type { EstadoOS } from "@/shell/dental"
import raw from "./data.json"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Una lesion afecta una cara puntual, o la pieza entera (corona, endodoncia, ausente).
export type Lesion = { fdi: number; cara: Cara | "todas"; estado: EstadoPieza }

export type Visita = { fecha: string; nota: string; profesional: string; lesiones: Lesion[] }

export type Ficha = {
  id: string
  paciente: string
  edad: number
  obraSocial: string
  estadoOS: EstadoOS
  alertas: string[] // alergias, medicacion, condiciones. Van en chips de danger.
  ultimaVisita: string
  diasSinSesion: number
  plan: { nombre: string; sesionesHechas: number; sesionesTotales: number }
  visitas: Visita[]
}

// Las 32 piezas del adulto, todas sanas. El punto de partida de cualquier ficha.
function bocaSana(): Pieza[] {
  const fdis: number[] = []
  for (const q of [1, 2, 3, 4]) for (let n = 1; n <= 8; n++) fdis.push(q * 10 + n)
  return fdis.map((fdi) => ({
    fdi,
    caras: Object.fromEntries(CARAS.map((c) => [c, "sana"])) as Record<Cara, EstadoPieza>,
  }))
}

// Reconstruye el odontograma tal como estaba despues de la visita `hasta` (inclusive).
export function piezasEnVisita(ficha: Ficha, hasta: number): Pieza[] {
  const piezas = bocaSana()
  ficha.visitas.slice(0, hasta + 1).forEach((v) => {
    v.lesiones.forEach((l) => {
      const p = piezas.find((x) => x.fdi === l.fdi)
      if (!p) return
      if (l.cara === "todas") CARAS.forEach((c) => (p.caras[c] = l.estado))
      else p.caras[l.cara] = l.estado
    })
  })
  return piezas
}

export async function getFichas(): Promise<Ficha[]> {
  await sleep(300)
  return structuredClone(raw.fichas) as Ficha[]
}

export async function getFicha(id: string): Promise<Ficha | undefined> {
  await sleep(150)
  return (structuredClone(raw.fichas) as Ficha[]).find((f) => f.id === id)
}
