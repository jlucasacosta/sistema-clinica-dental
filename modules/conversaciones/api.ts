// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Cada hilo esta atado a un turno o a una ficha: en una clinica nadie escribe por
// escribir, escribe para confirmar, reprogramar o preguntar por el dolor.
// Datos 100% ficticios.

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

const HILOS: Hilo[] = [
  {
    id: "H-01",
    paciente: "Martina Sobrero",
    motivo: "Obra social rechazada",
    canal: "whatsapp",
    ultimo: "¿Entonces cuanto me sale particular?",
    hora: "10:14",
    sinLeer: 2,
    mensajes: [
      { id: "m1", de: "clinica", texto: "Hola Martina. Mutual Aurora rechazo la autorizacion de la obturacion.", hora: "09:31" },
      { id: "m2", de: "paciente", texto: "¿Como que la rechazo? Si pague el coseguro el mes pasado.", hora: "09:48" },
      { id: "m3", de: "clinica", texto: "El rechazo es por la cobertura del tratamiento, no por el coseguro. Podemos reclamarlo, tarda unos 15 dias.", hora: "10:02" },
      { id: "m4", de: "paciente", texto: "Y mientras tanto el diente me sigue doliendo.", hora: "10:09" },
      { id: "m5", de: "paciente", texto: "¿Entonces cuanto me sale particular?", hora: "10:14" },
      { id: "m6", de: "paciente", texto: "Necesito saber hoy porque el turno era para esta tarde.", hora: "10:14" },
    ],
  },
  { id: "H-02", paciente: "Lautaro Bidegain", motivo: "Conducto sin terminar", canal: "whatsapp", ultimo: "—", hora: "hace 4 m", sinLeer: 0, mensajes: [
    { id: "m1", de: "clinica", texto: "Lautaro, quedo abierta la camara pulpar de la 36. Es importante que vuelvas.", hora: "hace 4 m" },
  ] },
  { id: "H-03", paciente: "Abril Nardelli", motivo: "Extraccion cordal", canal: "whatsapp", ultimo: "Confirmo el turno de las 11:50", hora: "08:40", sinLeer: 0, mensajes: [
    { id: "m1", de: "clinica", texto: "Abril, recorda venir con alguien que te acompañe.", hora: "08:22" },
    { id: "m2", de: "paciente", texto: "Confirmo el turno de las 11:50", hora: "08:40" },
  ] },
  { id: "H-04", paciente: "Ramiro Cuestas", motivo: "Ferula de descarga", canal: "email", ultimo: "¿La ferula se usa toda la noche?", hora: "09:05", sinLeer: 1, mensajes: [
    { id: "m1", de: "paciente", texto: "¿La ferula se usa toda la noche?", hora: "09:05" },
  ] },
  { id: "H-05", paciente: "Ezequiel Pombo", motivo: "Autorizacion en tramite", canal: "web", ultimo: "Seguimos esperando la respuesta", hora: "ayer", sinLeer: 0, mensajes: [
    { id: "m1", de: "paciente", texto: "¿Salio la autorizacion de la protesis?", hora: "ayer" },
    { id: "m2", de: "clinica", texto: "Seguimos esperando la respuesta", hora: "ayer" },
  ] },
  { id: "H-06", paciente: "Delfina Grispo", motivo: "Profilaxis", canal: "whatsapp", ultimo: "Gracias! Nos vemos en 6 meses", hora: "ayer", sinLeer: 0, mensajes: [
    { id: "m1", de: "paciente", texto: "Gracias! Nos vemos en 6 meses", hora: "ayer" },
  ] },
  { id: "H-07", paciente: "Ignacio Zabaleta", motivo: "Endodoncia sesion 2", canal: "whatsapp", ultimo: "¿Puedo comer antes del turno?", hora: "09:58", sinLeer: 1, mensajes: [
    { id: "m1", de: "paciente", texto: "¿Puedo comer antes del turno?", hora: "09:58" },
  ] },
  { id: "H-08", paciente: "Federico Olguin", motivo: "Turno cancelado", canal: "whatsapp", ultimo: "No voy a poder ir hoy", hora: "07:50", sinLeer: 0, mensajes: [
    { id: "m1", de: "paciente", texto: "No voy a poder ir hoy", hora: "07:50" },
  ] },
  { id: "H-09", paciente: "Pilar Casaubon", motivo: "Recall semestral", canal: "email", ultimo: "—", hora: "hace 8 d", sinLeer: 0, mensajes: [
    { id: "m1", de: "clinica", texto: "Pilar, paso el tiempo del control. ¿Te agendamos?", hora: "hace 8 d" },
  ] },
  { id: "H-10", paciente: "Carla Vanzetti", motivo: "Corona provisoria", canal: "whatsapp", ultimo: "Se me movio un poco la corona", hora: "10:31", sinLeer: 1, mensajes: [
    { id: "m1", de: "paciente", texto: "Se me movio un poco la corona", hora: "10:31" },
  ] },
  { id: "H-11", paciente: "Sofia Etchegaray", motivo: "Endodoncia 46", canal: "whatsapp", ultimo: "Confirmado para las 16:30", hora: "09:12", sinLeer: 0, mensajes: [
    { id: "m1", de: "paciente", texto: "Confirmado para las 16:30", hora: "09:12" },
  ] },
  { id: "H-12", paciente: "Nicolas Baigorria", motivo: "Urgencia", canal: "whatsapp", ultimo: "No llego, se me hizo tarde", hora: "hace 2 d", sinLeer: 0, mensajes: [
    { id: "m1", de: "paciente", texto: "No llego, se me hizo tarde", hora: "hace 2 d" },
  ] },
  { id: "H-13", paciente: "Matias Ferreyra", motivo: "Protesis sin retirar", canal: "email", ultimo: "—", hora: "hace 1 a", sinLeer: 0, mensajes: [
    { id: "m1", de: "clinica", texto: "Matias, la protesis esta lista desde el año pasado.", hora: "hace 1 a" },
  ] },
]

export async function getHilos(): Promise<Hilo[]> {
  await sleep(300)
  return HILOS
}
