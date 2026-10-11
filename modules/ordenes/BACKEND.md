# Backend — Ficha clínica y odontograma
> Guía de implementación completa: docs/IMPLEMENTAR.md.

- Tabla `visitas` (ficha_id, fecha, profesional_id, nota) y `lesiones`
  (visita_id, fdi smallint, cara text | 'todas', estado text).
- El odontograma NO se guarda como snapshot: es la SUMA de las lesiones de todas las
  visitas hasta una fecha. `piezasEnVisita()` es la reducción, y en SQL es una
  window function ordenada por fecha. Guardar 32 piezas por visita sería denormalizar.
- Historia clínica: registro médico-legal. `UPDATE` y `DELETE` en lote PROHIBIDOS;
  las correcciones van como una visita nueva. RLS por profesional + auditoría append-only.
- Reemplazar: modules/ordenes/api.ts. Misma firma.
