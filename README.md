# ESMALTE — Sistema para clínicas dentales

Un sistema de gestión para consultorios odontológicos: el **odontograma** con las 32 piezas dentales y sus caras pintables una por una, un control deslizante que rebobina la historia clínica del paciente, y una agenda donde cada columna es un sillón. Un sistema demo hecho con Next.js.

> Es un demo **frontend** con datos de ejemplo (mock). No tiene backend conectado: sirve para ver cómo se ve y cómo funciona un sistema así, y para aprender a construirlo.

---

## Demo en vivo
👉 https://sistema-clinica-dental.vercel.app

## Sumate al Club de la IA

Aprendé a crear tu Agencia de IA y conseguir tu primer cliente. Eso lo trabajamos adentro del Club de la IA, nuestro Skool privado.

👉 https://www.skool.com/club-de-la-ia-8047/about

---

## Qué incluye
- Fichas: el **odontograma interactivo** — las 32 piezas numeradas con el sistema FDI, cada una con sus 5 caras. Tocás una cara y cambia de estado (sana, caries, obturada, corona, endodoncia, ausente, a extraer)
- **Historial del odontograma**: arrastrás el control del historial y ves la boca del paciente cambiar visita por visita. Una caries que se obtura, una pieza que se extrae
- Agenda: un día, una columna por sillón, y cada turno ocupa el sillón durante **montaje + atención + esterilización**. El tiempo es continuo: un hueco de 20 minutos se ve como un hueco de 20 minutos
- Panel general: el estado de los turnos del día en una sola barra, la ocupación de cada sillón y la producción del mes
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

## Cambiar los datos de ejemplo

Todos los datos que ves (pacientes, turnos, fichas, mensajes) viven en archivos `data.json`, uno por módulo:

- `modules/agenda/data.json`: sillones, profesionales y turnos del día
- `modules/ordenes/data.json`: fichas clínicas con sus visitas y lesiones
- `modules/contactos/data.json`: el padrón de pacientes
- `modules/conversaciones/data.json`: los hilos de mensajes
- `modules/dashboard/data.json`: lo que muestra el panel

Editá un archivo, guardá y recargá la página para ver el cambio. Los datos son **solo de lectura**: si en la pantalla cambiás el estado de una cara del odontograma, ese cambio vive solo en el navegador. Al apretar F5 todo vuelve a como está en el JSON, y nada se guarda en ningún lado.

Todos los nombres, teléfonos y mails de ejemplo son inventados.

## Estructura de carpetas

```
app/          las pantallas (una carpeta por ruta) y el layout
modules/      un módulo por pantalla: index.tsx (la UI), api.ts (las funciones) y data.json (los datos)
shell/        el chasis: theme.ts, navegación, el odontograma y los componentes de dominio
docs/         IMPLEMENTAR.md: la guía para conectar un backend real
DISENO.md     la ficha de diseño: por qué se ve como se ve
.env.example  los nombres de las variables de entorno, sin valores
```

## Llevalo a producción

Este repo sigue siendo un **demo frontend sin backend conectado**: no trae base de datos, login ni tareas automáticas, y la seguridad de una clínica real no se improvisa. Cuando quieras convertirlo en un sistema real, la guía paso a paso está en **[docs/IMPLEMENTAR.md](docs/IMPLEMENTAR.md)**. Te lleva por:

1. Clonar y correr local
2. Qué función de cada `api.ts` va con qué tabla
3. Supabase: base de datos, seguridad por rol (RLS) y login
4. Railway: recordatorios de turno y recall de pacientes con pg-boss
5. Vercel: publicar el sistema
6. IA para sugerir respuestas en Mensajes
7. Checklist de seguridad antes de cargar pacientes reales

Ojo: las historias clínicas son **datos de salud**. La guía incluye un aviso de privacidad que tenés que leer antes de usar datos reales.

## Licencia

MIT: podés usarlo, copiarlo y modificarlo. El texto completo está en el archivo [LICENSE](LICENSE).

## Te trabaste

Si algo no te salió, preguntá en el Club de la IA.

## Sumate al Club de la IA

Aprendé a crear tu Agencia de IA y conseguir tu primer cliente. Eso lo trabajamos adentro del Club de la IA, nuestro Skool privado.

👉 https://www.skool.com/club-de-la-ia-8047/about
