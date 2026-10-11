# Backend — Configuración
> Guía de implementación completa: docs/IMPLEMENTAR.md.

- Sin tablas: hoy lee `shell/theme.ts`. Al conectar backend, `theme` se persiste por
  tenant en una tabla `settings` (jsonb) y se hidrata en el layout.
- Las constantes de dominio (recall, noShow, ocupacion, ciclo, plan) son configuración
  de la clínica, no constantes de código: viajan en el mismo jsonb.
