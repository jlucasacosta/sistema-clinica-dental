// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Personas, telefonos, obras sociales y mails 100% ficticios. Los patrones de mail
// estan mezclados a proposito y ninguno pasa el 30%: un listado uniforme grita "generado".
import type { EstadoOS } from "@/shell/dental"
import raw from "./data.json"

export type Paciente = {
  id: string
  nombre: string
  edad: number
  email: string
  telefono: string
  obraSocial: string
  estadoOS: EstadoOS
  ultimaVisita: string
  diasDesdeVisita: number
  alertas: number // cuantas alertas medicas tiene la ficha
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getPacientes(): Promise<Paciente[]> {
  await sleep(300)
  return structuredClone(raw.pacientes) as Paciente[]
}
