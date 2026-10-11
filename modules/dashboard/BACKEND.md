# Backend — Jornada (dashboard)
> Guía de implementación completa: docs/IMPLEMENTAR.md.

- Sin tablas propias: agrega `turnos`, `tratamientos` y `pacientes`.
- La barra-estado-jornada es un `count(*) group by estado` sobre los turnos de hoy.
- El donut de producción agrupa `tratamientos` del mes por categoría.
- El recall se deriva de `max(fecha)` por paciente; los umbrales (theme.recall) son
  diseño, no dato: viven en el cliente.
- Reemplazar: modules/dashboard/api.ts (mock -> queries agregadas). Misma firma.
- Las cinco consultas se piden juntas con `useCarga`: si una falla, el tablero muestra "Reintentar".
  Mientras cargan se ve "—" y un esqueleto estático, nunca un 0.
- Coherencia del demo: `jornada`, `proximos` y `ocupacion` de data.json están calculados a partir de los
  turnos de modules/agenda/data.json a las 11:05. Si editás un turno, actualizalos.
