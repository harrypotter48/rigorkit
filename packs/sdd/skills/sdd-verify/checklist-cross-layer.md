# Checklist cross-layer

Se usa cuando un cambio agrega, renombra o cambia el tipo de un campo que viaja entre capas. Si el cambio toca una sola capa, no aplica.

El bug que más se repite no es la lógica rota: es el **drift entre capas**. Cada capa compila por separado y el typecheck no lo detecta; aparece en runtime o en producción.

O se arregla en el momento, o queda escrito como mismatch conocido en el spec o en el baseline. Nunca un "lo arreglo después" sin anotar.

1. **Entity / modelo**: ¿el campo existe, tiene la nulabilidad correcta y el tipo correcto? Ojo: un `decimal` de la base de datos puede llegar como `string`.
2. **Migración**: ¿existe? ¿Es idempotente? ¿El `down()` es honesto? Si no se puede revertir sin perder datos, se dice en un comentario.
3. **DTO / validación**: ¿tiene el validador correcto? Lo que es opcional en la entity también lo es en el DTO, y al revés.
4. **Tipo compartido**: el modelo y el request/response que cruzan back ↔ front viven **una sola vez** en un paquete compartido, no duplicados en cada lado.
5. **Todos los productores**: es el paso que más se salta. Busca **cada** sitio que escribe el campo (checkout público, formulario admin, webhook, job, import…).
6. **Consumidores de lectura**: ¿alguien asume el formato viejo? (ej. multiplica por 100 porque esperaba centavos).
7. **Seeds / fixtures**: ¿un reseed desde cero refleja el estado nuevo?

Typecheck limpio en todas las capas prueba que los tipos no chocan, no que el dato fluye bien. Para rutas críticas, ver `dod-critical.md`.
