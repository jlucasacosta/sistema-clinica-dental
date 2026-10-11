// dental.ts · El dominio de la clinica en un solo lugar: piezas, caras, recall, turnos.
// Los umbrales viven en theme.recall / theme.noShow / theme.ocupacion / theme.ciclo.
// Ningun componente inventa un numero magico ni escribe un color: solo pide la clase.
// Tailwind NO ve clases armadas por concatenacion: TODOS los mapas son literales.
import { theme } from "./theme"

// --- Anatomia. Sistema FDI: dos digitos, cuadrante + pieza (1 = incisivo central,
// 8 = tercer molar / cordal). Cuadrante 1 sup-der, 2 sup-izq, 3 inf-izq, 4 inf-der. ---
export type Cuadrante = 1 | 2 | 3 | 4
export type Cara = "oclusal" | "vestibular" | "lingual" | "mesial" | "distal"

export const CARAS: Cara[] = ["oclusal", "vestibular", "lingual", "mesial", "distal"]

// Las piezas anteriores (1-3) no tienen oclusal: tienen incisal. Mismo path, otro rotulo.
export function rotuloCaraCentral(fdi: number): "oclusal" | "incisal" {
  const n = fdi % 10
  return n <= 3 ? "incisal" : "oclusal"
}

export const CUADRANTES: Cuadrante[] = [1, 2, 3, 4]

// Los cuadrantes se dibujan como se miran en la boca del paciente:
// arriba 1 (der) y 2 (izq), abajo 4 (der) y 3 (izq). El 1 y el 4 van invertidos
// porque su pieza 1 esta pegada a la linea media, en el centro.
export function piezasDe(cuadrante: Cuadrante): number[] {
  const base = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => cuadrante * 10 + n)
  return cuadrante === 1 || cuadrante === 4 ? [...base].reverse() : base
}

export function nombrePieza(fdi: number): string {
  const n = fdi % 10
  if (n === 1) return "Incisivo central"
  if (n === 2) return "Incisivo lateral"
  if (n === 3) return "Canino"
  if (n === 4) return "Primer premolar"
  if (n === 5) return "Segundo premolar"
  if (n === 6) return "Primer molar"
  if (n === 7) return "Segundo molar"
  return "Tercer molar"
}

// --- Estados de la pieza y de cada cara ---
// Siete estados contra cuatro semanticos. El odontograma recibe una EXENCION explicita:
// es un diagrama de dominio, no una lista de badges. El neutro significa "sin patologia",
// no es gris-sobre-gris. Los badges de la ficha siguen en semanticos, cero gris.
export type EstadoPieza =
  | "sana"
  | "caries"
  | "obturada"
  | "corona"
  | "endodoncia"
  | "ausente"
  | "a extraer"

export const ESTADOS: EstadoPieza[] = [
  "sana",
  "caries",
  "obturada",
  "corona",
  "endodoncia",
  "ausente",
  "a extraer",
]

// El relleno de cada CARA del diagrama.
// `a extraer` colisionaba en color con `caries`: se desambigua por FORMA (la cruz
// diagonal que dibuja el odontograma encima), no por un color nuevo.
// El primary teal NUNCA es un estado: se confundiria con el verde de "sana".
export const caraFill: Record<EstadoPieza, string> = {
  sana: "fill-surface",
  caries: "fill-danger",
  obturada: "fill-info",
  corona: "fill-warning",
  endodoncia: "fill-accent",
  ausente: "fill-subtle",
  "a extraer": "fill-danger/40",
}
export const caraStroke: Record<EstadoPieza, string> = {
  sana: "stroke-muted", // DISENO.md: sana = contorno muted. stroke-border daba 1.28:1 (1.4.11)
  caries: "stroke-danger",
  obturada: "stroke-info",
  corona: "stroke-warning",
  endodoncia: "stroke-accent",
  ausente: "stroke-muted",
  "a extraer": "stroke-danger",
}
export const chipEstado: Record<EstadoPieza, string> = {
  sana: "bg-subtle text-muted",
  caries: "bg-danger/15 text-danger",
  obturada: "bg-info/15 text-info",
  corona: "bg-warning/15 text-warning",
  endodoncia: "bg-accent/20 text-accent-ink", // el coral como texto da 2.4:1; accent-ink 5.3:1
  ausente: "bg-subtle text-muted",
  "a extraer": "bg-danger/15 text-danger",
}
export const puntoEstado: Record<EstadoPieza, string> = {
  sana: "bg-border",
  caries: "bg-danger",
  obturada: "bg-info",
  corona: "bg-warning",
  endodoncia: "bg-accent",
  ausente: "bg-muted",
  "a extraer": "bg-danger",
}

// Una pieza esta "sana" solo si TODAS sus caras lo estan. Si alguna cara tiene
// patologia, la pieza hereda el estado mas grave. Jerarquia de gravedad:
const GRAVEDAD: Record<EstadoPieza, number> = {
  sana: 0,
  obturada: 1,
  corona: 2,
  endodoncia: 3,
  caries: 4,
  "a extraer": 5,
  ausente: 6,
}

export function estadoDePieza(caras: Record<Cara, EstadoPieza>): EstadoPieza {
  const vals = Object.values(caras)
  if (vals.includes("ausente")) return "ausente"
  return vals.reduce((peor, e) => (GRAVEDAD[e] > GRAVEDAD[peor] ? e : peor), "sana" as EstadoPieza)
}

export function esPatologica(e: EstadoPieza): boolean {
  return e === "caries" || e === "a extraer"
}

// --- Recall: cuanto hace que el paciente no viene ---
export type NivelRecall = "al dia" | "a llamar" | "perdido"

export function nivelDeRecall(diasDesdeUltimaVisita: number): NivelRecall {
  if (diasDesdeUltimaVisita >= theme.recall.vencido) return "perdido"
  if (diasDesdeUltimaVisita >= theme.recall.alerta) return "a llamar"
  return "al dia"
}

export const chipRecall: Record<NivelRecall, string> = {
  "al dia": "bg-success/15 text-success",
  "a llamar": "bg-warning/15 text-warning",
  perdido: "bg-danger/15 text-danger",
}

// --- Estado del turno del dia ---
export type EstadoTurno = "confirmado" | "en sala" | "atendido" | "ausente" | "cancelado"

export const ESTADOS_TURNO: EstadoTurno[] = ["atendido", "en sala", "confirmado", "ausente", "cancelado"]

export const chipTurno: Record<EstadoTurno, string> = {
  confirmado: "bg-info/15 text-info",
  "en sala": "bg-primary/15 text-primary",
  atendido: "bg-success/15 text-success",
  ausente: "bg-danger/15 text-danger",
  cancelado: "bg-subtle text-muted", // estado neutro: no es un error, no va en danger
}
// El relleno de la banda de ATENCION del bloque de turno (la del medio del tri-banda).
// Literal, con la opacidad ya adentro: `rellenoTurno[e] + "/20"` no lo ve Tailwind.
export const bandaAtencion: Record<EstadoTurno, string> = {
  confirmado: "bg-info/20",
  "en sala": "bg-primary/20",
  atendido: "bg-success/20",
  ausente: "bg-danger/20",
  cancelado: "bg-subtle",
}
export const rellenoTurno: Record<EstadoTurno, string> = {
  confirmado: "bg-info",
  "en sala": "bg-primary",
  atendido: "bg-success",
  ausente: "bg-danger",
  cancelado: "bg-muted",
}
// El segmento de la barra-estado-jornada.
export const segmentoTurno: Record<EstadoTurno, string> = {
  confirmado: "bg-info/30",
  "en sala": "bg-primary/30",
  atendido: "bg-success/30",
  ausente: "bg-danger/30",
  cancelado: "bg-subtle",
}

// --- Estado de la autorizacion de la obra social ---
export type EstadoOS = "aprobada" | "en tramite" | "rechazada" | "particular"

export const chipOS: Record<EstadoOS, string> = {
  aprobada: "bg-success/15 text-success",
  "en tramite": "bg-warning/15 text-warning",
  rechazada: "bg-danger/15 text-danger",
  particular: "bg-subtle text-muted",
}
// Rotulo de display. El VALOR del enum no se toca (lo compara el codigo y lo valida un CHECK
// de SQL): solo el texto que ve el usuario lleva tilde.
export const rotuloOS: Record<EstadoOS, string> = {
  aprobada: "aprobada",
  "en tramite": "en trámite",
  rechazada: "rechazada",
  particular: "particular",
}

// --- El plan de tratamiento se da por abandonado si pasaron demasiados dias sin sesion ---
export function planAbandonado(diasSinSesion: number, progreso: number): boolean {
  return progreso < 1 && diasSinSesion >= theme.plan.abandonado
}

// --- Reloj de la agenda: minutos desde medianoche <-> "HH:MM" ---
export function hhmm(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = Math.round(minutos % 60)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
