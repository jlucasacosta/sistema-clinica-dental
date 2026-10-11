# Backend — Agenda por sillón
> Guía de implementación completa: docs/IMPLEMENTAR.md.

- Tablas `sillones`, `dentistas`, `turnos` (sillon_id, dentista_id, paciente_id,
  inicio timestamptz, duracion_min, estado, obra_social).
- `montaje` y `esterilizacion` NO se guardan por turno: son constantes de la clínica
  (theme.ciclo). Si un día dejan de serlo, pasan a la tabla `sillones`.
- Constraint de solapamiento: un sillón no puede tener dos turnos cuyos rangos
  (inicio - montaje, fin + esterilizacion) se pisen. `EXCLUDE USING gist`.
- Realtime: suscribir a `turnos` para que la grilla se mueva sola.
- Reemplazar: modules/agenda/api.ts. Misma firma.
- La carga usa `useCarga` (shell/carga.tsx): si las funciones de api.ts rechazan la promesa, la
  pantalla muestra "No pudimos cargar los datos" con "Reintentar". No atrapes el error en api.ts.
- Hacer clic en un turno abre una ficha lateral (shell/ficha-lateral.tsx). Las acciones (recordatorio,
  reprogramar, marcar como atendido) hoy son de demo y no guardan: al conectarlas, cada una es un
  UPDATE/INSERT sobre `turnos` con su regla de rol.
- `AHORA` (api.ts) es una hora fija de demo; con backend, la hora real.
