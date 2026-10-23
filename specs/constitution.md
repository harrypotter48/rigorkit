# Constitución — rigorkit

Principios innegociables. Todo spec, plan y task debe cumplirlos.

1. **Agnóstico de herramienta**: skills en formato Agent Skills (`SKILL.md`); agentes en formato neutro que convierte `install.sh`. Nada escrito a mano por herramienta.
2. **Autocontenido y dependencia blanda**: cada skill usa solo archivos de su carpeta; entre packs se invoca por nombre, nunca por ruta, y la falta de otro pack nunca rompe.
3. **Rol y parada**: toda skill (salvo las de referencia) y todo agente declaran su rol del top 1%; toda skill termina en un punto de parada que espera aprobación.
4. **YAML válido**: `name` igual a la carpeta, con prefijo del pack; `description` entre comillas simples, de 1024 caracteres como máximo.
5. **Genérico y sin secretos**: nada de código, nombres internos ni datos de negocio de ningún trabajo; ningún secreto.
6. **Referenciar, no copiar**: las skills de terceros no se copian al repo.
7. **No pisar al usuario**: `install.sh` nunca reemplaza un archivo de instrucciones del usuario; solo escribe entre marcadores y guarda `.bak`.
8. **Barato en contexto**: las reglas globales duran unos 300 tokens; lo que se carga en cada turno se paga en cada turno.

## Rutas críticas (DoD reforzado)
| Ruta | Por qué es crítica | Camino crítico de regresión |
|---|---|---|
| `install.sh` | Escribe en carpetas y archivos de instrucciones del usuario | `--dry-run` en `--project` y `--global` + instalación real en una carpeta temporal |
| `packs/*/rules.md` | Se carga en cada turno, en todas las sesiones del usuario | Revisión del tamaño (unos 300 tokens) |
