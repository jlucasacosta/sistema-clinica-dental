// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dato sigue al arquetipo: una agenda por sillon con ciclo de box necesita
// `inicio`, `duracion` y el SILLON, no una fila por dia. Los minutos de montaje y
// esterilizacion NO viven aca: salen de theme.ciclo. El bloque los dibuja.
// Personas y obras sociales 100% ficticias.
import type { EstadoTurno } from "@/shell/dental"
import raw from "./data.json"

export type Sillon = { id: string; nombre: string }
export type Dentista = { id: string; nombre: string }

export type Turno = {
  id: string
  sillonId: string
  dentistaId: string
  paciente: string
  fichaId: string
  tratamiento: string
  inicio: number // minutos desde medianoche
  duracion: number // minutos de atencion (sin montaje ni esterilizacion)
  estado: EstadoTurno
  obraSocial: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// La jornada del consultorio, en minutos desde medianoche.
export const APERTURA = 8 * 60
export const CIERRE = 19 * 60

export async function getSillones(): Promise<Sillon[]> {
  await sleep(150)
  return structuredClone(raw.sillones) as Sillon[]
}

export async function getDentistas(): Promise<Dentista[]> {
  await sleep(150)
  return structuredClone(raw.dentistas) as Dentista[]
}

export async function getTurnosDia(fecha: string): Promise<Turno[]> {
  await sleep(300)
  void fecha
  return structuredClone(raw.turnos) as Turno[]
}
