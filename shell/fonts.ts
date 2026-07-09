// fonts.ts · La voz de ESMALTE.
// Bricolage Grotesque = grotesca contemporanea con filo: titulos y numeros de pieza.
// Public Sans = neutra, densa, muy legible: se banca la tabla de pacientes y los
// rotulos de las 32 piezas del odontograma sin cansar.
// Las dos son variables: no hace falta pedirles pesos explicitos.
import { Bricolage_Grotesque, Public_Sans } from "next/font/google"

export const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading-src",
})
export const bodyFont = Public_Sans({ subsets: ["latin"], display: "swap", variable: "--font-body-src" })

export const fontClass = `${headingFont.variable} ${bodyFont.variable}`
