# EARS: cómo escribir requisitos

Cada requisito funcional se numera `RF-n` y usa **uno** de estos 5 patrones:

| Patrón | Forma | Cuándo |
|---|---|---|
| Ubicuo | EL SISTEMA \<hará\> | Siempre se cumple |
| Evento | CUANDO \<disparador\>, EL SISTEMA \<hará\> | Responde a algo |
| Estado | MIENTRAS \<estado\>, EL SISTEMA \<hará\> | Durante una condición |
| Opcional | DONDE \<característica\>, EL SISTEMA \<hará\> | Solo si la característica existe |
| No deseado | SI \<condición\>, ENTONCES EL SISTEMA \<hará\> | Errores y casos límite |

## Reglas
- Un requisito por frase: si hace falta un "y" para unir dos comportamientos, son dos requisitos.
- Sin adjetivos que no se puedan medir ("rápido", "intuitivo", "robusto"): se escribe el umbral o no se escribe.
- Si no se te ocurre cómo comprobar un requisito, está mal escrito.
- Lo que no se sabe se marca `[NECESITA ACLARACIÓN: <pregunta concreta>]`. Nunca se inventa.

## Ejemplo
Bien:
> RF-4: SI el nombre ya existe (sin distinguir mayúsculas ni espacios al inicio o al final),
> ENTONCES EL SISTEMA no creará un duplicado e informará del conflicto.

Mal:
> ~~RF-4: El sistema debe manejar bien los duplicados y ser rápido.~~
> No sigue ningún patrón EARS, no se puede verificar, junta dos ideas y usa un adjetivo que no se puede medir.
