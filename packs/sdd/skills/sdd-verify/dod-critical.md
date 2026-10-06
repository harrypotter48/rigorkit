# Definition of Done reforzado (rutas críticas)

Aplica cuando el triage marcó el cambio como **crítico**: toca dinero, aislamiento entre tenants, permisos o migraciones sobre tablas con datos reales (una tabla nueva y vacía no cuenta), según la tabla de rutas críticas de `specs/constitution.md`. **Si hay duda, se trata como crítico.**

Ese tipo de bug no aparece en el typecheck: aparece en producción, cuando ya hay dinero o datos de clientes mezclados.

## Los 4 requisitos, en orden
1. **El typecheck es el punto de partida**, no el final. En cada capa tocada (ver `checklist-cross-layer.md`).
2. **Test de comportamiento**: el camino feliz **y** la falla relevante (idempotencia, condición de carrera, error que se debe relanzar, acceso de otro tenant, rol sin permiso).
3. **Smoke real** (local, con datos reales, no solo mocks) antes de decir "listo". Un test prueba lo que se te ocurrió probar; el smoke encuentra lo que no.
4. **Regresión del camino crítico existente**: el flujo fijo que declara la constitución para esa ruta, corrido después del cambio. No sirve que lo nuevo funcione si se rompió lo que ya andaba.

## Reporte honesto
Si falta algo, se dice. "Typecheck limpio y tests verdes, falta el smoke" es una entrega válida. Decir "listo" cuando falta el paso 3 es lo que después termina en un incidente.
