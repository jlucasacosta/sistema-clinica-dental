// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dashboard es `tablero-jornada`: riel de proximos turnos + barra-estado-jornada +
// donut de produccion + alertas de recall. No reusa el `mosaico-mando` del sistema
// anterior (el abogado del diablo lo veto por reciclaje consecutivo).
import type { Jornada } from "@/shell/barra-jornada"
import type { Porcion } from "@/shell/donut"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getJornada(): Promise<Jornada> {
  await sleep(250)
  return { atendido: 7, "en sala": 2, confirmado: 7, ausente: 3, cancelado: 1 }
}

// La produccion del mes, partida en categorias de tratamiento: part-of-whole puro.
export async function getProduccion(): Promise<Porcion[]> {
  await sleep(300)
  return [
    { id: "1", label: "Profilaxis", valor: 46, tono: "primary" },
    { id: "2", label: "Obturaciones", valor: 31, tono: "info" },
    { id: "3", label: "Endodoncias", valor: 12, tono: "accent" },
    { id: "4", label: "Coronas y protesis", valor: 9, tono: "warning" },
    { id: "5", label: "Extracciones", valor: 7, tono: "muted" },
  ]
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
  return [
    { id: "1", hora: "11:10", paciente: "Ramiro Cuestas", tratamiento: "Obturacion 16", sillon: "Sillon 1", minutosPara: 5 },
    { id: "2", hora: "11:50", paciente: "Abril Nardelli", tratamiento: "Extraccion cordal 28", sillon: "Sillon 2", minutosPara: 45 },
    { id: "3", hora: "12:00", paciente: "Carla Vanzetti", tratamiento: "Corona provisoria", sillon: "Sillon 4", minutosPara: 55 },
    { id: "4", hora: "13:00", paciente: "Diego Aramburu", tratamiento: "Ferula de descarga", sillon: "Sillon 3", minutosPara: 115 },
    { id: "5", hora: "13:30", paciente: "Camila Duarte", tratamiento: "Control de ortodoncia", sillon: "Sillon 1", minutosPara: 145 },
    { id: "6", hora: "14:20", paciente: "Ignacio Zabaleta", tratamiento: "Endodoncia 36, sesion 2", sillon: "Sillon 2", minutosPara: 195 },
  ]
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
  return [
    { id: "1", paciente: "Lautaro Bidegain", motivo: "Conducto 36 sin terminar", dias: 292, telefono: "+54 9 351 449-6720" },
    { id: "2", paciente: "Martina Sobrero", motivo: "Obturacion 17 pendiente", dias: 90, telefono: "+54 9 11 4783-2610" },
    { id: "3", paciente: "Hernan Zubizarreta", motivo: "Control semestral", dias: 214, telefono: "+54 9 341 273-6605" },
    { id: "4", paciente: "Pilar Casaubon", motivo: "Profilaxis anual", dias: 188, telefono: "+54 9 351 175-6620" },
    { id: "5", paciente: "Matias Ferreyra", motivo: "Protesis sin retirar", dias: 401, telefono: "+54 9 261 634-8815" },
    { id: "6", paciente: "Guadalupe Insaurralde", motivo: "Control post endodoncia", dias: 176, telefono: "+54 9 341 402-5573" },
  ]
}

export type Ocupacion = { sillon: string; ocupado: number; disponible: number }

export async function getOcupacion(): Promise<Ocupacion[]> {
  await sleep(250)
  return [
    { sillon: "Sillon 1", ocupado: 300, disponible: 660 },
    { sillon: "Sillon 2", ocupado: 510, disponible: 660 },
    { sillon: "Sillon 3", ocupado: 240, disponible: 660 },
    { sillon: "Sillon 4", ocupado: 170, disponible: 660 },
  ]
}
