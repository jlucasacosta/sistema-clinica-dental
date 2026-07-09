# ESMALTE — Sistema para clínicas dentales

Un sistema de gestión para consultorios odontológicos: el **odontograma** con las 32 piezas dentales y sus caras pintables una por una, un control deslizante que rebobina la historia clínica del paciente, y una agenda donde cada columna es un sillón. Un sistema demo hecho con Next.js.

> Es un demo **frontend** con datos de ejemplo (mock). No tiene backend conectado: sirve para ver cómo se ve y cómo funciona un sistema así, y para aprender a construirlo.

---

## Demo en vivo
👉 https://sistema-clinica-dental.vercel.app

## Sumate a la comunidad (gratis)

Estás aprendiendo a crear sistemas como este con Claude Code, entrá a la comunidad gratuita de WhatsApp. Ahí comparto cómo se hacen desde cero.

👉 https://chat.whatsapp.com/DExFTzgVMO5Ka9BG1cShDH

---

## Qué incluye
- Fichas: el **odontograma interactivo** — las 32 piezas numeradas con el sistema FDI, cada una con sus 5 caras. Tocás una cara y cambia de estado (sana, caries, obturada, corona, endodoncia, ausente, a extraer)
- **Odontograma timelapse**: arrastrás el control del historial y ves la boca del paciente cambiar visita por visita. Una caries que se obtura, una pieza que se extrae
- Agenda: un día, una columna por sillón, y cada turno ocupa el sillón durante **montaje + atención + esterilización**. El tiempo es continuo: un hueco de 20 minutos se ve como un hueco de 20 minutos
- Jornada: el estado de los turnos del día en una sola barra, la ocupación de cada sillón y la producción del mes
- Pacientes: el padrón con la obra social y a quién hay que llamar
- Mensajes: cada hilo atado a un motivo clínico
- Configuración

## Requisitos (instalá esto primero)

Necesitás dos programas gratis en tu computadora:

1. **Node.js** (versión 18 o mayor). Descargalo en https://nodejs.org y elegí la opción **LTS**.
2. **Git**. Descargalo en https://git-scm.com

Para chequear que quedaron instalados, abrí una terminal y escribí:

    node -v
    git --version

Si te devuelven un número de versión, ya está.

## Cómo clonar y correr (paso a paso)

1. Abrí una terminal en la carpeta donde quieras guardar el proyecto.
2. Cloná el repo:

       git clone https://github.com/jlucasacosta/sistema-clinica-dental.git

3. Entrá a la carpeta del proyecto:

       cd sistema-clinica-dental

4. Instalá las dependencias (baja lo que el proyecto necesita):

       npm install

5. Levantá el proyecto:

       npm run dev

6. Abrí el navegador en http://localhost:3000

Listo. Vas a ver el sistema funcionando.

## Personalizarlo

Todo el diseño (colores, tipografía, nombre de la marca) vive en un solo archivo: `shell/theme.ts`. Cambiás eso y muta el sistema entero.

Probá algo concreto: en ese archivo, subí `ciclo.esterilizacion` de `20` a `45` minutos. Toda la agenda se aprieta, porque cada bloque de turno dibuja su banda de esterilización desde ahí. Después bajá `recall.alerta` de `180` a `60` días y mirá cómo se llena de amarillo la lista de pacientes a llamar. Ningún componente tiene un número ni un color escrito a mano.

## Te trabaste

Si algo no te salió, preguntá en la comunidad:

👉 https://chat.whatsapp.com/DExFTzgVMO5Ka9BG1cShDH
