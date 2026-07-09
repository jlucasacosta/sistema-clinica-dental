// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dato sigue al arquetipo: una agenda por sillon con ciclo de box necesita
// `inicio`, `duracion` y el SILLON, no una fila por dia. Los minutos de montaje y
// esterilizacion NO viven aca: salen de theme.ciclo. El bloque los dibuja.
// Personas y obras sociales 100% ficticias.
import type { EstadoTurno } from "@/shell/dental"

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

const SILLONES: Sillon[] = [
  { id: "S1", nombre: "Sillon 1" },
  { id: "S2", nombre: "Sillon 2" },
  { id: "S3", nombre: "Sillon 3" },
  { id: "S4", nombre: "Sillon 4" },
]

const DENTISTAS: Dentista[] = [
  { id: "D1", nombre: "Dra. Ferrante" },
  { id: "D2", nombre: "Dr. Ivancich" },
  { id: "D3", nombre: "Dra. Quinteros" },
]

const h = (hora: number, min = 0) => hora * 60 + min

const TURNOS: Turno[] = [
  // Sillon 1 — Dra. Ferrante
  { id: "T-01", sillonId: "S1", dentistaId: "D1", paciente: "Delfina Grispo", fichaId: "F-1044", tratamiento: "Profilaxis", inicio: h(8, 30), duracion: 40, estado: "atendido", obraSocial: "Particular" },
  { id: "T-02", sillonId: "S1", dentistaId: "D1", paciente: "Malena Riquelme", fichaId: "F-1049", tratamiento: "Blanqueamiento", inicio: h(9, 40), duracion: 60, estado: "atendido", obraSocial: "Prevencion Sur" },
  { id: "T-03", sillonId: "S1", dentistaId: "D1", paciente: "Ramiro Cuestas", fichaId: "F-1047", tratamiento: "Obturacion 16", inicio: h(11, 10), duracion: 50, estado: "en sala", obraSocial: "Circulo Salud" },
  { id: "T-04", sillonId: "S1", dentistaId: "D1", paciente: "Camila Duarte", fichaId: "F-1050", tratamiento: "Control de ortodoncia", inicio: h(13, 30), duracion: 30, estado: "confirmado", obraSocial: "Mutual Aurora" },
  { id: "T-05", sillonId: "S1", dentistaId: "D1", paciente: "Martina Sobrero", fichaId: "F-1042", tratamiento: "Obturacion 17", inicio: h(15, 40), duracion: 50, estado: "ausente", obraSocial: "Mutual Aurora" },
  { id: "T-06", sillonId: "S1", dentistaId: "D3", paciente: "Tomas Escalante", fichaId: "F-1051", tratamiento: "Consulta inicial", inicio: h(17, 20), duracion: 40, estado: "confirmado", obraSocial: "Prevencion Sur" },

  // Sillon 2 — Dr. Ivancich (endodoncias, sesiones largas)
  { id: "T-07", sillonId: "S2", dentistaId: "D2", paciente: "Joaquin Bentancor", fichaId: "F-1043", tratamiento: "Corona definitiva 25", inicio: h(8, 0), duracion: 80, estado: "atendido", obraSocial: "Circulo Salud" },
  { id: "T-08", sillonId: "S2", dentistaId: "D2", paciente: "Ezequiel Pombo", fichaId: "F-1045", tratamiento: "Extraccion 27", inicio: h(10, 0), duracion: 70, estado: "atendido", obraSocial: "Mutual Aurora" },
  { id: "T-09", sillonId: "S2", dentistaId: "D2", paciente: "Abril Nardelli", fichaId: "F-1046", tratamiento: "Extraccion cordal 28", inicio: h(11, 50), duracion: 90, estado: "en sala", obraSocial: "Prevencion Sur" },
  { id: "T-10", sillonId: "S2", dentistaId: "D2", paciente: "Ignacio Zabaleta", fichaId: "F-1052", tratamiento: "Endodoncia 36, sesion 2", inicio: h(14, 20), duracion: 80, estado: "confirmado", obraSocial: "Circulo Salud" },
  { id: "T-11", sillonId: "S2", dentistaId: "D2", paciente: "Sofia Etchegaray", fichaId: "F-1053", tratamiento: "Endodoncia 46", inicio: h(16, 30), duracion: 90, estado: "confirmado", obraSocial: "Particular" },

  // Sillon 3 — Dra. Quinteros
  { id: "T-12", sillonId: "S3", dentistaId: "D3", paciente: "Valentina Ocampo", fichaId: "F-1054", tratamiento: "Profilaxis", inicio: h(8, 40), duracion: 40, estado: "atendido", obraSocial: "Prevencion Sur" },
  { id: "T-13", sillonId: "S3", dentistaId: "D3", paciente: "Federico Olguin", fichaId: "F-1055", tratamiento: "Obturacion 24", inicio: h(9, 50), duracion: 50, estado: "cancelado", obraSocial: "Mutual Aurora" },
  { id: "T-14", sillonId: "S3", dentistaId: "D3", paciente: "Antonella Prieto", fichaId: "F-1056", tratamiento: "Control post extraccion", inicio: h(11, 20), duracion: 20, estado: "atendido", obraSocial: "Circulo Salud" },
  { id: "T-15", sillonId: "S3", dentistaId: "D3", paciente: "Diego Aramburu", fichaId: "F-1057", tratamiento: "Ferula de descarga", inicio: h(13, 0), duracion: 40, estado: "confirmado", obraSocial: "Particular" },
  { id: "T-16", sillonId: "S3", dentistaId: "D1", paciente: "Lucia Sanguinetti", fichaId: "F-1058", tratamiento: "Profilaxis", inicio: h(14, 40), duracion: 40, estado: "confirmado", obraSocial: "Prevencion Sur" },
  { id: "T-17", sillonId: "S3", dentistaId: "D3", paciente: "Nicolas Baigorria", fichaId: "F-1059", tratamiento: "Consulta de urgencia", inicio: h(16, 20), duracion: 30, estado: "ausente", obraSocial: "Mutual Aurora" },

  // Sillon 4 — mixto, jornada mas corta (menos ocupado: el hueco se tiene que ver)
  { id: "T-18", sillonId: "S4", dentistaId: "D1", paciente: "Lautaro Bidegain", fichaId: "F-1048", tratamiento: "Conducto 36, sesion 2", inicio: h(9, 0), duracion: 70, estado: "ausente", obraSocial: "Particular" },
  { id: "T-19", sillonId: "S4", dentistaId: "D2", paciente: "Carla Vanzetti", fichaId: "F-1060", tratamiento: "Corona provisoria", inicio: h(12, 0), duracion: 60, estado: "confirmado", obraSocial: "Circulo Salud" },
  { id: "T-20", sillonId: "S4", dentistaId: "D3", paciente: "Gaston Uriburu", fichaId: "F-1061", tratamiento: "Profilaxis", inicio: h(17, 0), duracion: 40, estado: "confirmado", obraSocial: "Prevencion Sur" },
]

export async function getSillones(): Promise<Sillon[]> {
  await sleep(150)
  return SILLONES
}

export async function getDentistas(): Promise<Dentista[]> {
  await sleep(150)
  return DENTISTAS
}

export async function getTurnosDia(fecha: string): Promise<Turno[]> {
  await sleep(300)
  void fecha
  return TURNOS
}
