// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dashboard es `tablero-jornada`: riel de proximos turnos + barra-estado-jornada +
// donut de produccion + alertas de recall. No reusa el `mosaico-mando` del sistema
// anterior (el abogado del diablo lo veto por reciclaje consecutivo).
import type { Jornada } from "@/shell/barra-jornada"
import type { Porcion } from "@/shell/donut"
import raw from "./data.json"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getJornada(): Promise<Jornada> {
  await sleep(250)
  return structuredClone(raw.jornada) as Jornada
}

// La produccion del mes, partida en categorias de tratamiento: part-of-whole puro.
export async function getProduccion(): Promise<Porcion[]> {
  await sleep(300)
  return structuredClone(raw.produccion) as Porcion[]
}

export type Proximo = {
  id: string
  hora: string
  paciente: string
  tratamiento: string
  sillon: string
  minutosPara: number
}

export async function getProximos(): Promise<Proximo[]> {
  await sleep(280)
  return structuredClone(raw.proximos) as Proximo[]
}

export type Recall = {
  id: string
  paciente: string
  motivo: string
  dias: number
  telefono: string
}

export async function getRecall(): Promise<Recall[]> {
  await sleep(300)
  return structuredClone(raw.recall) as Recall[]
}

export type Ocupacion = { sillon: string; ocupado: number; disponible: number }

export async function getOcupacion(): Promise<Ocupacion[]> {
  await sleep(250)
  return structuredClone(raw.ocupacion) as Ocupacion[]
}
