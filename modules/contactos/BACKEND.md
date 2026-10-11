# Backend — Pacientes (contactos)
> Guía de implementación completa: docs/IMPLEMENTAR.md.

- Tabla `pacientes`: nombre, fecha_nacimiento, email, telefono, obra_social,
  estado_autorizacion, alertas (text[]).
- `edad` y `diasDesdeVisita` se derivan, no se guardan.
- PII real: nunca en el repo. Estos datos son ficticios. Historia clínica = dato
  sensible de salud: cifrado en reposo y RLS estricta.
- Reemplazar: modules/contactos/api.ts. Misma firma.
- La carga usa `useCarga`: un rechazo de getPacientes muestra el aviso de error con "Reintentar".
- Hacer clic en un paciente abre su ficha lateral con todos los campos de la fila. Las acciones
  (recordatorio, agendar turno) son de demo; "Abrir ficha clínica" navega a /ordenes.
- El recall (al día / a llamar / perdido) se calcula en el cliente con theme.recall a partir de
  `diasDesdeVisita`.
