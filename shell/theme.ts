// theme.ts · ESMALTE Odontologia (sistema clinica dental)
// LA PALANCA DE DISEÑO. Nada se hardcodea: todo lee de aca.
// Ficha de Diseño: ver DISENO.md.
//
// Cliche rechazado: la clinica celeste pastel / blanco hospital / el azul "confianza
// medica" con degrade. Trata a la odontologia como una guardia medica: fria, aseptica,
// intercambiable. Un consultorio dental es mitad taller de precision (instrumental,
// milimetros, odontograma) y mitad estetica (cara a cara con el paciente).
// La referencia que gana: el ATELIER DE PRECISION CALIDO. Menta de frescor bucal
// en tono profundo (no pastel) + coral de encia y labio, que lo humaniza.
//
// LIGHT porque recepcion trabaja con luz de local comercial, y porque la lampara
// odontologica lava cualquier pantalla oscura junto al sillon.

export type Theme = {
  brand: { name: string; logo?: string }
  mode: "light" | "dark"
  nav: "sidebar" | "topbar" | "rail"
  elevation: "raised" | "outlined" | "flat"
  badge: "pill" | "square"
  radius: "sharp" | "soft" | "round"
  density: "compact" | "comfortable"
  font: { heading: string; body: string }
  colors: {
    primary: string
    accent: string
    bg: string
    surface: string
    fg: string
    muted: string
    border: string
    subtle: string
    success: string
    warning: string
    danger: string
    info: string
  }
  // Constantes de dominio de la clinica. Ningun componente inventa un numero magico.
  recall: { alerta: number; vencido: number } // dias desde la ultima visita
  noShow: { alerta: number } // fraccion de ausentismo del dia que enciende la alarma
  ocupacion: { meta: number } // fraccion de sillon ocupado que se busca
  ciclo: { montaje: number; esterilizacion: number } // minutos, las bandas del bloque de turno
  plan: { abandonado: number } // dias sin sesion para dar un plan por abandonado
}

export const esmalte: Theme = {
  brand: { name: "ESMALTE" },
  mode: "light",
  nav: "sidebar",
  elevation: "raised",
  badge: "square",
  radius: "round",
  density: "comfortable",
  font: { heading: "Bricolage Grotesque", body: "Public Sans" },
  colors: {
    // teal MENTA (hue ~166): tiene que leer verde, no cyan, para no ecoar el
    // petroleo #0c5460 del taller (hue ~189).
    primary: "#0e7c66",
    accent: "#f26a5a", // coral: encia y labio. La contraparte calida del quirofano.
    bg: "#f3f6f5",
    surface: "#ffffff", // en claro, la tarjeta es blanca sobre un fondo gris muy suave
    fg: "#142523",
    muted: "#5c6b68",
    border: "#dde5e3",
    subtle: "#eaf0ee",
    // Semanticos saturados para light. Los cuatro pasan 4.5:1 sobre surface blanco:
    // green-700 y no #16a34a, que da ~3.4 y FALLA como texto.
    success: "#15803d",
    warning: "#b45309", // ambar oscuro: legible como texto. Lee como "tapa dorada" en la corona.
    danger: "#c81e1e",
    info: "#2563eb",
  },
  recall: { alerta: 180, vencido: 365 },
  noShow: { alerta: 0.15 },
  ocupacion: { meta: 0.8 },
  ciclo: { montaje: 10, esterilizacion: 20 },
  plan: { abandonado: 90 },
}

export const theme: Theme = esmalte
