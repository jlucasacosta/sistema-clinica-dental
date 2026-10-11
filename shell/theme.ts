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
    // Era #0e7c66: oscurecido al minimo (mismo hue 168) para que el texto primary llegue
    // a 4.5:1 sobre su tinte bg-primary/15 (ver auditorias/sistema-clinica-dental.md F-02).
    primary: "#0f6b59",
    accent: "#f26a5a", // coral: encia y labio. La contraparte calida del quirofano.
    bg: "#f3f6f5",
    surface: "#ffffff", // en claro, la tarjeta es blanca sobre un fondo gris muy suave
    fg: "#142523",
    muted: "#5c6b68",
    border: "#dde5e3",
    subtle: "#eaf0ee",
    // Semanticos para light. Se usan como TEXTO sobre su propio tinte (bg-X/15 text-X) y ese
    // par tiene que llegar a 4.5:1 sobre surface, subtle (fila en hover) y bg. Los valores
    // originales (#15803d, #b45309, #c81e1e, #2563eb) daban 4.1-4.5 sobre surface y 3.8-3.9
    // sobre bg: se oscurecieron al minimo hacia fg, sin cambiar el hue.
    success: "#156d38",
    warning: "#944a0e", // ambar oscuro: legible como texto. Lee como "tapa dorada" en la corona.
    danger: "#b41f1f",
    info: "#2257c5",
  },
  recall: { alerta: 180, vencido: 365 },
  noShow: { alerta: 0.15 },
  ocupacion: { meta: 0.8 },
  ciclo: { montaje: 10, esterilizacion: 20 },
  plan: { abandonado: 90 },
}

export const theme: Theme = esmalte
