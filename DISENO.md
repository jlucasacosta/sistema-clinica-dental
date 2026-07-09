# Ficha de Diseño — sistema-clinica-dental

## Marca
**ESMALTE Odontología** (marca ficticia, 100% inventada).
Voz: atelier de precisión. La identidad no es una sonrisa de stock: es el **diente, con sus cinco caras pintadas**.

## Usuario y contexto
La **secretaria / recepcionista**, no el odontólogo. El odontólogo está en el sillón con guantes de nitrilo y campo estéril: no toca la pantalla durante el acto — dicta y otro carga. Quien vive adentro del software ocho horas es recepción: agenda, confirma, cobra, verifica obra social, reprograma no-shows. El dueño mira reportes una vez al día.

Recepción trabaja en un all-in-one a 60 cm, con luz mixta de local. En el consultorio hay un monitor secundario bajo la lámpara odontológica, que lava la pantalla: por eso los targets son grandes y el contraste alto. **La ficha se lee con guantes puestos.**

La tarea que repite 40 veces por día es gestionar el turno: verlo, confirmarlo, marcar *llegó / atendido / ausente*, y abrir la ficha del paciente que sigue.

Lo que se rompe si el dato llega tarde: el **no-show** (sillón vacío = hora muerta que no se recupera, el costo más caro del rubro), el **tratamiento no registrado** (se rehace o no se cobra), la **obra social mal verificada** (prestación rechazada, se atiende gratis) y el **plan de tratamiento abandonado** a mitad de camino.

## La pantalla que manda — y la que se graba
Acá hubo una contradicción real entre el estratega y el productor, y el abogado del diablo la resolvió: **no compiten, viven en planos distintos.**

- **Funcionalmente manda la agenda.** La clínica factura por sillón ocupado; cada hueco es plata perdida. Es el caballo de trabajo de la secretaria y merece ser el módulo más pulido.
- **Visualmente NO puede protagonizar.** Sillón + turnos + `light` es exactamente la barbería (#03, su grilla semanal por barbero). Si el reel abre con columnas de sillones, el sistema se confunde con el de la barbería y este pasa a ser el video más flojo de la serie.

**Resolución:** la agenda es central en el uso e **invisible en cámara**. El **componente estrella y el frame-firma viven en `ordenes` (la ficha clínica)**, sobre el odontograma — el único activo que ningún otro sistema de la colección puede imitar.

## Dirección de arte
**Cliché rechazado:** la clínica celeste pastel / blanco hospital / el azul "confianza médica" con degradé. Trata a la odontología como una guardia médica: fría, aséptica, intercambiable. Un consultorio dental no es un sanatorio: es mitad **taller de precisión** (instrumental, milímetros, odontograma) y mitad **estética** (cara a cara con el paciente).

**Referencia que gana:** el **atelier de precisión cálido**. Instrumental limpio sobre superficies claras, verde menta de frescor bucal, y un toque de coral que evoca encía y labio, y humaniza. Superficies planas, mucho blanco real, bordes finos.

## Palancas del theme (PIEL)
| Palanca | Valor | Por qué |
|---|---|---|
| mode | **light** | paridad (#07 es impar) + luz de local comercial |
| nav | **sidebar** | recepción lo tiene abierto todo el día: herramienta de escritorio |
| elevation | **raised** | la ficha flota sobre el chasis. Combo `sidebar + raised` que **nadie tenía** |
| radius | **round** | cercanía sanitaria, y la esquina suave agranda el área del target |
| density | **comfortable** | se opera con guantes: piezas ≥40px, botones ≥44px. Un target de 24px no se pincha con nitrilo |
| badge | **square** | gestión médico-legal seria, y lo separa del `pill` del vecino #06 |
| fuentes | **Bricolage Grotesque** (heading) + **Public Sans** (body) | carácter contemporáneo con filo + neutra densa que se banca el odontograma. Ninguna usada antes |
| color | primary **teal menta #0e7c66** + accent **coral #f26a5a** | menta = frescor bucal, resignificado en tono profundo y saturado, no pastel. Coral = encía y labio: la contraparte cálida que evita el quirófano |

El abogado exigió que el primary **lea verde-menta y no cyan**, para no ecoar el petróleo `#0c5460` del taller (#05). Corregido a `#0e7c66` (hue ~166, claramente verde) contra el hue ~189 del taller.

## Módulos → arquetipo
| Módulo | Arquetipo | Qué es |
|---|---|---|
| **ordenes** (fichas) ⭐ | `odontograma-interactivo` (NUEVO) | mapa anatómico FDI de 32 piezas en 4 cuadrantes. Cada pieza es un SVG de **5 caras clickeables por separado** (oclusal, vestibular, lingual, mesial, distal). Click en una cara cicla su estado. **No es una grilla de 32 celdas: es un diagrama espacial** |
| **agenda** | `agenda-sillon-ciclo` (NUEVO) | un solo día, columnas = sillones físicos, eje Y de **tiempo continuo** (no slots fijos). Cada turno es un bloque **tri-banda**: montaje (rayado) / atención (sólido) / esterilización (rayado). Codifica el **ciclo del sillon**, no "ocupado". Un riel de color por dentista ata sus bloques entre columnas |
| **dashboard** | `tablero-jornada` (NUEVO) | riel de próximos turnos + `barra-estado-jornada` + `donut` de producción + alertas de recall |
| **conversaciones** | `master-detail` | hilos + panel |
| **contactos** | `tabla-densa` | padrón de pacientes con obra social y última visita |
| **config** | `acordeon` | plomería. Reuso invisible: config no es héroe |

**Condición bloqueante sobre la agenda:** las tres defensas son *load-bearing*. Si el bloque de turno colapsa a un rectángulo de color plano, `agenda-sillon-ciclo` **es** la grilla semanal de la barbería con otro eje, y queda **vetado**. La tri-banda, el eje continuo y el riel del dentista no son adorno: son lo que lo hace otro arquetipo.

## KPI · Gráfico · Iconos · Estructura
- **KPI: `barra-estado-jornada`** (NUEVO) — una sola barra horizontal partida en segmentos **proporcionales** al conteo de cada estado del día (atendidos / en curso / ausentes / cancelados), con el número adentro del segmento. No es `barra-metas` (#01), que mide progreso contra un objetivo: esto es un **ratio apilado multi-estado**.
- **Gráfico: `donut`** — el último libre del catálogo, y encaja honesto: la producción del mes partida en categorías de tratamiento (profilaxis, caries, endodoncia, corona, extracción) es *part-of-whole* puro, el caso canónico del donut. Reclamarlo **cierra el registro de gráficos**.
- **Combo KPI + gráfico: `barra-estado-jornada` + `donut`** — único en la colección.
- **Iconos: `lucide-fino`** (strokeWidth 1.5) — precisión clínica. Distinto del `icon-chip` del vecino #06.
- **Estructura: `sidebar-con-banner-de-paciente`** — en las fichas, un banner con inicial tintada, edad, obra social y las **alertas médicas** en chips de `danger`.

## Componente estrella — Historial del odontograma (`odontograma-timelapse`)
Vive en **ordenes** (la ficha clínica). Debajo del odontograma hay un **scrubber temporal**: un `input[range]` que indexa las visitas del paciente. Al arrastrarlo, las 32 piezas **repintan su estado histórico** con `transition: fill .3s`.

**Interacción grabable:** se arrastra el slider y se ve, en cámara, una caries volverse obturada, y una pieza marcada *a extraer* pasar a *ausente*. La historia clínica en capas temporales, animándose en vivo. Es el mismo canvas SVG del odontograma pero en modo lectura, no edición.

## Componente eliminado
**La vista de calendario MENSUAL de la agenda.** Todo CRM y todo software dental la trae por defecto. Acá se corta entera a favor del día único de `agenda-sillon-ciclo`.

Razón: la secretaria trabaja **hoy**, no el mes. La vista mensual es donde se esconden los no-shows — cada turno se reduce a un punto de color sin nombre ni estado, y el hueco de las 15:40 del jueves deja de doler. Si el hueco no duele, nadie lo llena.

*(El abogado vetó el eliminado original — "checkboxes de fila y acciones masivas" — por falso: ningún sistema de la colección tiene checkboxes, así que no se eliminaba nada. La prohibición de editar historias clínicas en lote queda como nota médico-legal, no como el eliminado titular.)*

## Los siete estados de una pieza, contra cuatro semánticos
Seis estados no entran en cuatro tokens. El diagrama recibe una **exención explícita**: el odontograma no es una lista de badges, es un diagrama de dominio, así que el neutro significa *sin patología* y no es gris-sobre-gris.

| Estado | Tratamiento |
|---|---|
| sana | contorno `muted`, sin relleno |
| caries | `danger`, sólo en la cara afectada |
| obturada | `info` |
| corona | `warning` (el ámbar lee como tapa dorada) |
| endodoncia | `accent` coral |
| ausente | `subtle` con trama |
| **a extraer** | `danger` + **tachado diagonal en negrita** |

`a extraer` colisionaba en color con `caries`. Se desambigua **por forma, no por color** (orden del abogado del diablo). El `primary` teal **nunca** se usa como estado de pieza: se confundiría con el verde de sano. Los badges de la ficha (plan, obra social, turno) siguen en semánticos, cero gris.

## Frame-firma
Un **diente gigante** en el centro, con sus cinco caras. Durante la toma, la cara oclusal pasa de sana a caries con un pulso, y el contador de piezas afectadas sube `3 → 4`. Al costado, la tensión: el plan de tratamiento clavado en **40%**, la obra social que **rechazó** la autorización, y el **no-show** de las 15:40.

El reel abre con el diente. Jamás con las columnas de sillones.

Test de un segundo: **la silueta anatómica del diente con las caras pintadas**. Nadie confunde una muela con una grilla semanal de barbero.

## Veredicto del abogado del diablo
**PASA** — con las seis órdenes aplicadas: (1) el dashboard deja de ser `mosaico-mando` (recién estrenado por #06) y pasa a `tablero-jornada`; (2) el eliminado real es la **vista mensual**, no las bulk-actions; (3) la agenda debe implementar tri-banda + eje continuo + riel de dentista, o queda vetada; (4) `a extraer` se desambigua por forma; (5) el primary se corrige a un teal que lee verde-menta; (6) la estrella vive en las fichas y el frame-firma es el diente.

### Diferenciación verificada
**PIEL** — vs cada sistema ya hecho:
- vs 01 inmobiliaria (light/sidebar/outlined/sharp/compact/square): elevation, radius, density, fuentes, color → **5** ✓
- vs 02 restaurante (dark/rail/raised/round/comfortable/pill): mode, nav, badge, fuentes, color → **5** ✓
- vs 03 barbería (light/topbar/flat/soft/comfortable/square): nav, elevation, radius, fuentes, color → **5** ✓
- vs 04 gimnasio (dark/sidebar/outlined/sharp/compact/pill): mode, elevation, radius, density, badge, fuentes, color → **7** ✓
- vs 05 taller (light/rail/flat/sharp/compact/square): nav, elevation, radius, density, fuentes, color → **6** ✓
- vs 06 automotora (dark/topbar/flat/soft/compact/pill): mode, nav, elevation, density, badge, fuentes, color → **7** ✓

`sidebar + raised` **no lo tiene nadie** (01 y 04 son sidebar+outlined; 02 es rail+raised), y no repite el `topbar + flat` del vecino de cola.

**ESQUELETO** — cuatro arquetipos nuevos (`odontograma-interactivo`, `agenda-sillon-ciclo`, `tablero-jornada`, `barra-estado-jornada`) · combo KPI + gráfico único, y el `donut` **cierra el catálogo de gráficos** · estrella (`odontograma-timelapse`) que nadie tiene · eliminado real (vista mensual de agenda) · cero imágenes de personas.
