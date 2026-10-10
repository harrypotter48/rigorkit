# Pack `architecture` — Capas, límites y extensibilidad

Referencias de arquitectura que un agente aplica al planear o implementar, y un revisor de solo lectura que comprueba que el código respeta las capas del proyecto.

## Qué trae
| Tipo | Nombre | Qué hace |
|---|---|---|
| Skill (referencia) | `arch-boundaries` | Arquitectura por capas o hexagonal: qué va en cada capa, la regla de dependencia, ports & adapters, receta para un feature nuevo y anti-patrones |
| Skill (referencia) | `arch-plugin-registry` | Hacer extensible un switch cerrado con un registry, reusando el ciclo de vida existente |
| Agente (solo lectura) | `arch-reviewer` | Revisa un diff contra las capas inferidas del proyecto y lista hallazgos con `archivo:línea`, severidad y veredicto |

Las skills de **referencia** no tienen etapa ni punto de parada propio: las carga otra skill o el usuario.

## Con el pack `sdd`
Si los dos packs están instalados:
- `sdd-implement`, al terminar cada task, le pasa a `arch-reviewer` el diff de la task. Arregla los hallazgos altos que introdujo y lista el resto.
- `sdd-verify` le pasa el diff completo del cambio. Un hallazgo alto introducido impide el veredicto "spec cumplido".

Sin este pack, `sdd` funciona igual: se salta la revisión y lo dice.

## Deuda técnica
Pídele al agente: "audita la arquitectura de `src/`". `arch-reviewer` devuelve la deuda agrupada por regla, con conteos y los peores casos. Si quieres guardarla, va en una sección "Deuda de arquitectura" del baseline del módulo.

## La convención del proyecto manda
La constitución, el `AGENTS.md` o la documentación de arquitectura del repo mandan sobre estas skills. Si no existen, el agente infiere las capas del código. Si el repo no tiene capas, no se imponen de paso.

## Instalar
```bash
./install.sh --pack architecture,sdd --agent claude --project ~/code/mi-repo
```
