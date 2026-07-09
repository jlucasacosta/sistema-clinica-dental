# Backend — Agenda por sillon
> Asume BACKEND_RULES.md.

- Tablas `sillones`, `dentistas`, `turnos` (sillon_id, dentista_id, paciente_id,
  inicio timestamptz, duracion_min, estado, obra_social).
- `montaje` y `esterilizacion` NO se guardan por turno: son constantes de la clinica
  (theme.ciclo). Si un dia dejan de serlo, pasan a la tabla `sillones`.
- Constraint de solapamiento: un sillon no puede tener dos turnos cuyos rangos
  (inicio - montaje, fin + esterilizacion) se pisen. `EXCLUDE USING gist`.
- Realtime: suscribir a `turnos` para que la grilla se mueva sola.
- Reemplazar: modules/agenda/api.ts. Misma firma.
