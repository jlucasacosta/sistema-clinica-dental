// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Cada hilo esta atado a un turno o a una ficha: en una clinica nadie escribe por
// escribir, escribe para confirmar, reprogramar o preguntar por el dolor.
// Datos 100% ficticios.
import raw from "./data.json"

export type Mensaje = { id: string; de: "paciente" | "clinica"; texto: string; hora: string }

export type Hilo = {
  id: string
  paciente: string
  motivo: string
  canal: "whatsapp" | "email" | "web"
  ultimo: string
  hora: string
  sinLeer: number
  mensajes: Mensaje[]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getHilos(): Promise<Hilo[]> {
  await sleep(300)
  return structuredClone(raw.hilos) as Hilo[]
}
