# Backend — Ficha clinica y odontograma
> Asume BACKEND_RULES.md.

- Tabla `visitas` (ficha_id, fecha, profesional_id, nota) y `lesiones`
  (visita_id, fdi smallint, cara text | 'todas', estado text).
- El odontograma NO se guarda como snapshot: es la SUMA de las lesiones de todas las
  visitas hasta una fecha. `piezasEnVisita()` es la reduccion, y en SQL es una
  window function ordenada por fecha. Guardar 32 piezas por visita seria denormalizar.
- Historia clinica: registro medico-legal. `UPDATE` y `DELETE` en lote PROHIBIDOS;
  las correcciones van como una visita nueva. RLS por profesional + auditoria append-only.
- Reemplazar: modules/ordenes/api.ts. Misma firma.
