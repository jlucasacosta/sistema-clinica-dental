# Backend — Mensajes (conversaciones)
> Guía de implementación completa: docs/IMPLEMENTAR.md.

- Tablas `hilos` y `mensajes`, con `paciente_id` y `motivo` en el hilo.
- Entrada por webhook de WhatsApp Business. Realtime sobre `mensajes`.
- Nunca mandar detalle clinico por canal no cifrado: el hilo referencia la ficha, no la copia.
- Reemplazar: modules/conversaciones/api.ts. Misma firma.
