# Backend — Pacientes (contactos)
> Asume BACKEND_RULES.md.

- Tabla `pacientes`: nombre, fecha_nacimiento, email, telefono, obra_social,
  estado_autorizacion, alertas (text[]).
- `edad` y `diasDesdeVisita` se derivan, no se guardan.
- PII real: nunca en el repo. Estos datos son ficticios. Historia clinica = dato
  sensible de salud: cifrado en reposo y RLS estricta.
- Reemplazar: modules/contactos/api.ts. Misma firma.
