// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dato sigue al arquetipo: un odontograma devuelve PIEZAS y CARAS, no filas.
// La historia clinica es ACUMULATIVA: cada visita agrega lesiones, y el estado del
// odontograma en una fecha es la suma de todas las visitas hasta esa fecha.
// Asi el timelapse no guarda 5 copias de 32 piezas: las reconstruye.
// Personas y obras sociales 100% ficticias.
import { CARAS, type Cara, type EstadoPieza } from "@/shell/dental"
import type { Pieza } from "@/shell/odontograma"
import type { EstadoOS } from "@/shell/dental"

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

// --- La ficha protagonista: cinco visitas, y la historia se ve moverse. ---
const VISITAS_MARTINA: Visita[] = [
  {
    fecha: "14/03/2024",
    nota: "Anamnesis y profilaxis. Se detectan dos caries incipientes.",
    profesional: "Dra. Ferrante",
    lesiones: [
      { fdi: 26, cara: "oclusal", estado: "caries" },
      { fdi: 36, cara: "distal", estado: "caries" },
    ],
  },
  {
    fecha: "02/07/2024",
    nota: "Se obtura la 26. La 36 avanzo a mesial. Molar 46 con caries profunda.",
    profesional: "Dra. Ferrante",
    lesiones: [
      { fdi: 26, cara: "oclusal", estado: "obturada" },
      { fdi: 36, cara: "mesial", estado: "caries" },
      { fdi: 46, cara: "oclusal", estado: "caries" },
    ],
  },
  {
    fecha: "19/11/2024",
    nota: "Endodoncia de la 46: la caries llego a la pulpa. Se obtura la 36.",
    profesional: "Dr. Ivancich",
    lesiones: [
      { fdi: 46, cara: "todas", estado: "endodoncia" },
      { fdi: 36, cara: "distal", estado: "obturada" },
      { fdi: 36, cara: "mesial", estado: "obturada" },
    ],
  },
  {
    fecha: "08/04/2025",
    nota: "Corona sobre la 46. Cordal 38 impactada: se indica extraccion.",
    profesional: "Dr. Ivancich",
    lesiones: [
      { fdi: 46, cara: "todas", estado: "corona" },
      { fdi: 38, cara: "todas", estado: "a extraer" },
      { fdi: 17, cara: "vestibular", estado: "caries" },
    ],
  },
  {
    fecha: "10/04/2026",
    nota: "Se extrae la 38. La 17 sigue sin tratar: el plan quedo a mitad de camino.",
    profesional: "Dra. Ferrante",
    lesiones: [
      { fdi: 38, cara: "todas", estado: "ausente" },
      { fdi: 48, cara: "todas", estado: "ausente" },
    ],
  },
]

const FICHAS: Ficha[] = [
  {
    id: "F-1042",
    paciente: "Martina Sobrero",
    edad: 34,
    obraSocial: "Mutual Aurora",
    estadoOS: "rechazada",
    alertas: ["Alergia a penicilina", "Embarazo 2do trimestre"],
    ultimaVisita: "10/04/2026",
    diasSinSesion: 90,
    plan: { nombre: "Rehabilitacion cuadrante inferior", sesionesHechas: 2, sesionesTotales: 5 },
    visitas: VISITAS_MARTINA,
  },
  {
    id: "F-1043",
    paciente: "Joaquin Bentancor",
    edad: 41,
    obraSocial: "Circulo Salud",
    estadoOS: "aprobada",
    alertas: ["Hipertension"],
    ultimaVisita: "02/07/2026",
    diasSinSesion: 7,
    plan: { nombre: "Endodoncia + corona 25", sesionesHechas: 3, sesionesTotales: 4 },
    visitas: [
      {
        fecha: "11/01/2026",
        nota: "Caries profunda en 25. Se indica endodoncia.",
        profesional: "Dr. Ivancich",
        lesiones: [{ fdi: 25, cara: "oclusal", estado: "caries" }],
      },
      {
        fecha: "22/04/2026",
        nota: "Endodoncia de la 25 completada.",
        profesional: "Dr. Ivancich",
        lesiones: [{ fdi: 25, cara: "todas", estado: "endodoncia" }],
      },
      {
        fecha: "02/07/2026",
        nota: "Corona provisoria. Caries nueva en 14.",
        profesional: "Dra. Ferrante",
        lesiones: [
          { fdi: 25, cara: "todas", estado: "corona" },
          { fdi: 14, cara: "distal", estado: "caries" },
        ],
      },
    ],
  },
  {
    id: "F-1044",
    paciente: "Delfina Grispo",
    edad: 27,
    obraSocial: "Particular",
    estadoOS: "particular",
    alertas: [],
    ultimaVisita: "05/07/2026",
    diasSinSesion: 4,
    plan: { nombre: "Profilaxis semestral", sesionesHechas: 1, sesionesTotales: 1 },
    visitas: [
      {
        fecha: "05/01/2026",
        nota: "Profilaxis. Sin patologia.",
        profesional: "Dra. Ferrante",
        lesiones: [],
      },
      {
        fecha: "05/07/2026",
        nota: "Profilaxis. Se obtura una caries incipiente en 16.",
        profesional: "Dra. Ferrante",
        lesiones: [{ fdi: 16, cara: "oclusal", estado: "obturada" }],
      },
    ],
  },
  {
    id: "F-1045",
    paciente: "Ezequiel Pombo",
    edad: 58,
    obraSocial: "Mutual Aurora",
    estadoOS: "en tramite",
    alertas: ["Anticoagulado", "Diabetes tipo 2"],
    ultimaVisita: "18/06/2026",
    diasSinSesion: 21,
    plan: { nombre: "Extracciones y protesis parcial", sesionesHechas: 2, sesionesTotales: 6 },
    visitas: [
      {
        fecha: "03/02/2026",
        nota: "Enfermedad periodontal avanzada. Cuatro piezas comprometidas.",
        profesional: "Dr. Ivancich",
        lesiones: [
          { fdi: 31, cara: "todas", estado: "a extraer" },
          { fdi: 41, cara: "todas", estado: "a extraer" },
          { fdi: 27, cara: "oclusal", estado: "caries" },
          { fdi: 37, cara: "vestibular", estado: "caries" },
        ],
      },
      {
        fecha: "18/06/2026",
        nota: "Se extraen 31 y 41. Restan las obturaciones.",
        profesional: "Dr. Ivancich",
        lesiones: [
          { fdi: 31, cara: "todas", estado: "ausente" },
          { fdi: 41, cara: "todas", estado: "ausente" },
        ],
      },
    ],
  },
  {
    id: "F-1046",
    paciente: "Abril Nardelli",
    edad: 19,
    obraSocial: "Prevencion Sur",
    estadoOS: "aprobada",
    alertas: [],
    ultimaVisita: "28/06/2026",
    diasSinSesion: 11,
    plan: { nombre: "Extraccion de cordales", sesionesHechas: 1, sesionesTotales: 2 },
    visitas: [
      {
        fecha: "12/05/2026",
        nota: "Cordales 18 y 28 impactadas.",
        profesional: "Dr. Ivancich",
        lesiones: [
          { fdi: 18, cara: "todas", estado: "a extraer" },
          { fdi: 28, cara: "todas", estado: "a extraer" },
        ],
      },
      {
        fecha: "28/06/2026",
        nota: "Se extrae la 18. Falta la 28.",
        profesional: "Dr. Ivancich",
        lesiones: [{ fdi: 18, cara: "todas", estado: "ausente" }],
      },
    ],
  },
  {
    id: "F-1047",
    paciente: "Ramiro Cuestas",
    edad: 46,
    obraSocial: "Circulo Salud",
    estadoOS: "aprobada",
    alertas: ["Bruxismo"],
    ultimaVisita: "01/07/2026",
    diasSinSesion: 8,
    plan: { nombre: "Ferula de descarga + obturaciones", sesionesHechas: 2, sesionesTotales: 3 },
    visitas: [
      {
        fecha: "14/03/2026",
        nota: "Desgaste oclusal generalizado por bruxismo.",
        profesional: "Dra. Ferrante",
        lesiones: [
          { fdi: 16, cara: "oclusal", estado: "caries" },
          { fdi: 26, cara: "oclusal", estado: "caries" },
        ],
      },
      {
        fecha: "01/07/2026",
        nota: "Se obturan 16 y 26. Se entrega ferula.",
        profesional: "Dra. Ferrante",
        lesiones: [
          { fdi: 16, cara: "oclusal", estado: "obturada" },
          { fdi: 26, cara: "oclusal", estado: "obturada" },
        ],
      },
    ],
  },
  {
    id: "F-1048",
    paciente: "Lautaro Bidegain",
    edad: 31,
    obraSocial: "Particular",
    estadoOS: "particular",
    alertas: [],
    ultimaVisita: "20/09/2025",
    diasSinSesion: 292,
    plan: { nombre: "Conducto en 36", sesionesHechas: 1, sesionesTotales: 3 },
    visitas: [
      {
        fecha: "20/09/2025",
        nota: "Se abre camara pulpar de la 36. El paciente no volvio.",
        profesional: "Dr. Ivancich",
        lesiones: [
          { fdi: 36, cara: "oclusal", estado: "caries" },
          { fdi: 36, cara: "mesial", estado: "caries" },
        ],
      },
    ],
  },
  {
    id: "F-1049",
    paciente: "Malena Riquelme",
    edad: 23,
    obraSocial: "Prevencion Sur",
    estadoOS: "aprobada",
    alertas: [],
    ultimaVisita: "07/07/2026",
    diasSinSesion: 2,
    plan: { nombre: "Blanqueamiento", sesionesHechas: 1, sesionesTotales: 2 },
    visitas: [
      { fecha: "07/07/2026", nota: "Primera sesion de blanqueamiento. Sin patologia.", profesional: "Dra. Ferrante", lesiones: [] },
    ],
  },
]

export async function getFichas(): Promise<Ficha[]> {
  await sleep(300)
  return FICHAS
}

export async function getFicha(id: string): Promise<Ficha | undefined> {
  await sleep(150)
  return FICHAS.find((f) => f.id === id)
}
